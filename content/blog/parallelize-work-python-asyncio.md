---
title: Parallelize work in Python with Asyncio
description:
date: 2025-12-20T21:30
tags: programmingx
---

Say we have a large amount of I/O-bound tasks (eg. network requests)
which we want to run.

We don't really care about what order we get results back in, but we
want to make requests in parallel, in order to speed things up.

A good candidate for doing this in Python is asynchronous code, using
coroutines and the [asyncio] module.

[asyncio]: https://docs.python.org/3/library/asyncio.html


## Desired interface

We would like to have a resusable function taking an action and an
iterable, and returning an iterable with the results:

``` python
async def parallelize[T](
    action: Callable[..., Coroutine[None, None, T]],
    argslist: Iterable[Iterable[Any]] | AsyncIterable[Iterable[Any]],
    numworkers: int,
) -> AsyncIterable[T]:
    pass
```

Usage example:

``` python

# List of URLs we want to retrieve
urls = [ ... ]

async with aiohttp.ClientSession() as session:

    async def action(url):
        async with session.get(url) as resp:
            await resp.read()
            return resp

    async for resp in parallelize(action, urls, numworkers=100):
        print(f"{resp.status} {resp.url}")
        if resp.ok:
            print(await resp.text())
```


## Implementation

The main entry point is the `parallelize()` function we've seen earlier.

It spawns a predefined amount of "workers" as asyncio tasks,
connecting them to an input and an output Queue, and providing them
with the `action` function to call on each set of arguments.

It then watches the queues, continuously yielding results until all
the input items have been processed.

``` python
async def parallelize[T](
    action: Callable[..., Coroutine[None, None, T]],
    argslist: Iterable[Iterable[Any]] | AsyncIterable[Iterable[Any]],
    numworkers: int,
) -> AsyncIterable[T]:

    inqueue = asyncio.Queue(maxsize=numworkers)
    outqueue = asyncio.Queue()

    tasks = []
    for worker_id in range(numworkers):
        task = asyncio.create_task(worker(worker_id, inqueue, outqueue, action))
        tasks.append(task)

    loader_task = asyncio.create_task(queue_loader(inqueue, argslist))

    while (
        (not loader_task.done())
        or (inqueue._unfinished_tasks > 0)  # HACK
        or (outqueue._unfinished_tasks > 0)  # HACK
    ):
        result = await outqueue.get()
        yield result
        outqueue.task_done()

    for task in tasks:
        task.cancel()

    await asyncio.gather(*tasks, return_exceptions=True)
```

### The worker task

The worker coroutine simply listens on the input queue, executing
actions on each set of input arguments, and putting the results back
in the output queue:


``` python
async def worker(
    worker_id: int,
    inqueue: asyncio.Queue,
    outqueue: asyncio.Queue,
    action: Callable[..., Coroutine],
):
    while True:
        args = await inqueue.get()
        result = await action(*args)
        outqueue.put_nowait(result)
        inqueue.task_done()
```

### Loading the input queue

We could just pre-load the queue before starting the workers, but that
could use a significant amount of memory, depending on how input
arguments are generated.

For example, the input iterable might actually be a generator,
generating millions or billions of URLs to be crawled, so we don't
want to store them in memory all at once.

A more clever way is to use a function to obtain new items and append
them to the input queue only as items from the queue get depleted:

``` python
async def queue_loader(queue: asyncio.Queue, items: AsyncIterable | Iterable):
    if not isinstance(items, AsyncIterable):
        items = make_aiter(items)
    async for item in items:
        await queue.put(item)  # this blocks when the queue is full


async def make_aiter(items: Iterable) -> AsyncIterable:
    for item in items:
        yield item
```

The `make_aiter()` function is just for convenience, so we can
indifferently pass either a regular iterable (including a list), or an
async iterable.
