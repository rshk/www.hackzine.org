#!/usr/bin/env python3

from datetime import datetime
import subprocess
import os
import unicodedata
import re

HERE = os.path.abspath(os.path.dirname(__file__))
CONTENT_FOLDER = os.path.join(HERE, 'content')


def slugify(value, allow_unicode=False):
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
        value = re.sub('[^\w\s-]', '', value, flags=re.U).strip().lower()
        return re.sub('[-\s]+', '-', value, flags=re.U)

    value = unicodedata.normalize('NFKD', value)\
                       .encode('ascii', 'ignore').decode('ascii')
    value = re.sub('[^\w\s-]', '', value).strip().lower()
    return re.sub('[-\s]+', '-', value)


def inputbox(title, default=''):
    output = subprocess.check_output([
        'dialog', '--stdout', '--inputbox', title, '0', '0', default,
    ])
    return output.decode('utf-8').strip()


def get_editor_command():
    visual = os.environ.get('VISUAL')
    if visual:
        return visual.split()
    editor = os.environ.get('EDITOR')
    if editor:
        return editor.split()
    return None


def open_editor(filename):
    editor_cmd = get_editor_command()
    if not editor_cmd:
        print('No $VISUAL or $EDITOR found')
        return

    subprocess.call(editor_cmd + [filename])


def main():
    post_title = inputbox('Post title')
    post_tags = inputbox('Post tags (comma-separated)')
    post_category = inputbox('Post category')
    now = datetime.utcnow()
    now_str = now.strftime('%Y-%m-%d %H:%M:%S')
    post_date = inputbox('Post date', default=now_str)
    post_slug = slugify(post_title)
    post_filename = '{:%Y-%m-%d}_{}.rst'.format(now, post_slug)
    post_file_path = os.path.join(CONTENT_FOLDER, post_filename)

    lines = [
        post_title,
        '#' * len(post_title),
        '',
        ':date: {}'.format(post_date),
        ':category: {}'.format(post_category),
        ':tags: {}'.format(post_tags),
        '',
        'Insert content here...',
    ]
    with open(post_file_path, 'wt') as fp:
        for line in lines:
            fp.write(line)
            fp.write('\n')

    print('Saved to ' + post_file_path)
    open_editor(post_file_path)


if __name__ == '__main__':
    main()
