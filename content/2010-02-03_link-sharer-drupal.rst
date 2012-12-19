Link sharer on Drupal
#####################

:tags: development, drupal, projects
:date: 2010-02-03 09:38:00
:category: Development

I just wanted something like the "share on facebook" button, but to post
links on my (this) blog. I thought I would have to write a module to do that
but.. no, Drupal itself allows us to do that directly :)

First, the CCK "Bookmark" Content
---------------------------------

First of all, I created a CCK content named "bookmark".
Here is the exported CCK code.

`Download CCK bookmark here <https://gist.github.com/4033693#file_bookmark_cck.php>`_

Second: the "bookmark" button
-----------------------------

Yep, I copied this from the facebook "SHARE IT" button.. :)

First, we need to enable the `Prepopulate <http://drupal.org/project/prepopulate>`_
Drupal module, that allows us to prefill the forms by URL.
Then, create some javascript code that could do the job

.. code:: javascript

    var d=document,f='http://www.example.org/node/add/bookmark-link',l=d.location,e=encodeURIComponent,p='?edit[field_url][0][url]='+e(l.href)+'&edit[title]='+e(d.title);
    1;
    a=function() {
      if (!window.open(f+p,'drupalsharer','toolbar=0,status=0,resizable=1,width=626,height=436')) l.href=f+p};
      if (/Firefox/.test(navigator.userAgent))  setTimeout(a,0); else{ a()
    }
    void(0)

(of course, remember to replace www.example.org with your real site URL)

Then, compress it to one-line and urlencode it.
The final result will look like this::

    javascript:var%20d%3Ddocument%2Cf%3D%27http%3A%2f%2fwww.example.org%2fnode%2fadd%2fbookmark-link%27%2Cl%3Dd.location%2Ce%3DencodeURIComponent%2Cp%3D%27%3Fedit%5Bfield_url%5D%5B0%5D%5Burl%5D%3D%27%2be%28l.href%29%2b%27%26edit%5Btitle%5D%3D%27%2be%28d.title%29%3B1%3Ba%3Dfunction%28%29%20%7Bif%20%28%21window.open%28f%2bp%2C%27drupalsharer%27%2C%27toolbar%3D0%2Cstatus%3D0%2Cresizable%3D1%2Cwidth%3D626%2Cheight%3D436%27%29%29l.href%3Df%2bp%7D%3Bif%20%28%2fFirefox%2f.test%28navigator.userAgent%29%29setTimeout%28a%2C0%29%3Belse%7Ba%28%29%7Dvoid%280%29%0A

Now, just create a bookmark in your browser pasting the above code as the
bookmark URL, and the job is done!

Next step, a view to show bookmarks
-----------------------------------

I then created a view to display links. You can find it
`here <https://gist.github.com/4033693/#file_bookmarks_view.php>`_.
