99 Bottles of beer
##################

:tags: python, challenges, development
:date: 2011-09-10 23:14:00
:category: Development

Do you know the popular programming challenge of generating the lyrics of the 99 Bottles of beer song using the shortest code possible?
There's even a websites that collects these scripts in many different languages: http://www.99-bottles-of-beer.net/.

I took the challenge..

..and here it is my solution, in just 237 bytes of Python code! :)

.. code:: python

    w=lambda c,d:'%s bottle%s of beer on the wall%s\n'%(c or'No','s'[:c!=1],d)
    for i in range(99,-1,-1):print"\n".join([(w(i,',')*2)[:-14]+'.','Take one down, pass it around,'if(i)else'Go to the store, buy some more,',w((i-1)%100,'.'),'']),

(Here it is, reformatted a bit for sake of "readability"..)

.. code:: python

    w = lambda c,d: '%s bottle%s of beer on the wall%s\n' \
        % (c or'No', 's'[:c!=1], d)
    for i in range(99,-1,-1):
        print "\n".join([
            (w(i,',')*2)[:-14] + '.',
            'Take one down, pass it around,' \
                if (i) else 'Go to the store, buy some more,',
            w((i-1) % 100, '.'),
            ''
            ]),
