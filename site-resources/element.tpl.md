project_path: /web/_project.yaml
book_path: /web/updates/_book.yaml

{# wf_updated_on: {{ {const d = new Date(); out += `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;} }}#}
{# wf_published_on: 2017-04-06 #}

# HowTo: Components – {{=it.title}} {: .page-title }

{% include "web/_shared/contributors/ewagasperowicz.html" %}
{% include "web/_shared/contributors/noms.html" %}
{% include "web/_shared/contributors/robdodson.html" %}
{% include "web/_shared/contributors/surma.html" %}

<link rel="stylesheet" href="prism-solarizedlight.css">
<link rel="stylesheet" href="main.css">

{{=it.intro}}

## Demo {: #demo }
<iframe src="{{=it.title}}_demo.html" class="demo" aria-label="live demo" role="region"></iframe>

## Example usage {: #usage }
<ul class="literate demo" id="{{=it.title}}_demo">
{{ for (let section of it.demoSections) { }}
<li class="{{=section.commentType.toLowerCase()}}">
<div class="literate-text {{? section.commentText.length <= 0}}empty{{?}}">{{=section.commentText}}</div>
<code class="literate-code">{{=section.codeText}}</code>
</li>
{{ } }}
</ul>

## Code {: #code }
<ul class="literate code" id="{{=it.title}}_impl">
  {{ for (let section of it.sections) { }}
<li class="{{=section.commentType.toLowerCase()}}">
<div class="literate-text {{? section.commentText.length <= 0}}empty{{?}}">{{=section.commentText}}</div>
<code class="literate-code">{{=section.codeText}}</code>
</li>
{{ } }}
</ul>
