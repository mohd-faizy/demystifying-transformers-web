import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('replacement.html', 'r', encoding='utf-8') as f:
    replacement = f.read()

start_marker = '<summary class="pro-heading style-h2">01 - Introduction to Transformer</summary>\n                            <div class="indented">\n'
end_marker = '\n                            </div>\n                        </details>\n                    </div>\n                    <div dir="auto">\n                        <details id="02-what-is-self-attention">'

start_idx = html.find(start_marker)
if start_idx == -1:
    print("Start marker not found")
    exit(1)
start_idx += len(start_marker)

end_idx = html.find(end_marker, start_idx)
if end_idx == -1:
    print("End marker not found")
    exit(1)

indented_replacement = '\n'.join('                                ' + line for line in replacement.split('\n'))

new_html = html[:start_idx] + indented_replacement + html[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
print("Updated successfully")
