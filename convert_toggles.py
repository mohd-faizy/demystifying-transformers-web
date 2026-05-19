import re

with open('notes.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def process_inline(text):
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    return text.strip()

# Document is a list of blocks. A block can be a heading with children.
class Node:
    def __init__(self, level, title):
        self.level = level
        self.title = title
        self.children = [] # can be text lines or other Nodes

root = Node(0, 'Root')
stack = [root]

in_table = False
table_lines = []

def process_table():
    if not table_lines:
        return
    html = ['<div class="tech-table-wrap">', '<table class="tech-table">', '<thead>', '<tr>']
    cols = [process_inline(col) for col in table_lines[0].split('|')[1:-1]]
    for col in cols:
        html.append(f'<th>{col}</th>')
    html.append('</tr>')
    html.append('</thead>')
    html.append('<tbody>')
    for row in table_lines[2:]:
        if not row.strip() or '---' in row:
            continue
        html.append('<tr>')
        cols = [process_inline(col) for col in row.split('|')[1:-1]]
        for col in cols:
            html.append(f'<td>{col}</td>')
        html.append('</tr>')
    html.append('</tbody>')
    html.append('</table>')
    html.append('</div>')
    stack[-1].children.append('\n'.join(html))
    table_lines.clear()

list_lines = []
def process_list():
    if not list_lines:
        return
    html = ['<div dir="auto"><ul class="bulleted-list">']
    for line in list_lines:
        html.append(f'<li style="list-style-type:disc">{process_inline(line[2:])}</li>')
    html.append('</ul></div>')
    stack[-1].children.append('\n'.join(html))
    list_lines.clear()

def flush():
    process_table()
    process_list()

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    if line.startswith('---'):
        flush()
        stack[-1].children.append('<div dir="auto"><hr /></div>')
        continue
        
    if line.startswith('|'):
        process_list()
        table_lines.append(line)
        continue
    else:
        process_table()

    if line.startswith('* '):
        list_lines.append(line)
        continue
    else:
        process_list()
        
    m = re.match(r'^(#{1,3})\s+(.*)', line)
    if m:
        level = len(m.group(1))
        title = process_inline(m.group(2))
        node = Node(level, title)
        
        while stack[-1].level >= level:
            stack.pop()
            
        stack[-1].children.append(node)
        stack.append(node)
        continue
        
    if line.startswith('> '):
        stack[-1].children.append(f'<div dir="auto"><blockquote>{process_inline(line[2:])}</blockquote></div>')
        continue
        
    stack[-1].children.append(f'<div dir="auto"><p>{process_inline(line)}</p></div>')

flush()

def render(node):
    if isinstance(node, str):
        return node
    
    html = []
    if node.level == 1:
        html.append(f'<div dir="auto"><h2 class="pro-heading style-h2">{node.title}</h2></div>')
        for child in node.children:
            html.append(render(child))
    elif node.level == 2:
        html.append('<div dir="auto">')
        html.append('<ul class="toggle">')
        html.append('<li>')
        html.append('<details>')
        html.append(f'<summary class="pro-heading style-h3">{node.title}</summary>')
        html.append('<div dir="auto">')
        for child in node.children:
            html.append(render(child))
        html.append('</div>')
        html.append('</details>')
        html.append('</li>')
        html.append('</ul>')
        html.append('</div>')
    elif node.level == 3:
        html.append('<div dir="auto">')
        html.append('<ul class="toggle">')
        html.append('<li>')
        html.append('<details>')
        html.append(f'<summary class="pro-heading style-h4">{node.title}</summary>')
        html.append('<div dir="auto">')
        for child in node.children:
            html.append(render(child))
        html.append('</div>')
        html.append('</details>')
        html.append('</li>')
        html.append('</ul>')
        html.append('</div>')
    else:
        for child in node.children:
            html.append(render(child))
    
    return '\n'.join(html)

html_text = render(root)

img1 = '''<div dir="ltr">
    <figure class="image" id="1918a6d6-2b53-804d-855a-c4be26a3533c"><a
            href="assets/images/part-1/01.png"><img
                src="assets/images/part-1/01.png" /></a>
        <figcaption><strong>Transformer [Generates the dynamic contextual
                embeddings]</strong></figcaption>
    </figure>
</div>'''

img2 = '''<div dir="ltr">
    <figure class="image" id="18f8a6d6-2b53-8098-8837-ec64cd9b1180"><a
            href="assets/images/part-1/02.png"><img
                src="assets/images/part-1/02.png" /></a></figure>
</div>'''

# Split before "13. Timeline" which is a level 1 heading, wait, timeline was # 13.
# So it's level 1 heading.
split_str = '<div dir="auto">\n<ul class="toggle">\n<li>\n<details>\n<summary class="pro-heading style-h3">13. Timeline of Transformer Evolution</summary>'
split_index = html_text.find(split_str)
if split_index == -1:
    # Just in case
    split_index = html_text.find('13. Timeline of Transformer Evolution')
    # Backup a bit
    split_index = html_text.rfind('<div dir="auto">', 0, split_index)

final_html = img1 + '\n' + html_text[:split_index] + '\n' + img2 + '\n' + html_text[split_index:]

with open('replacement.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

