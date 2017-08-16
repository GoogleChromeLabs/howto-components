project_path: /web/_project.yaml
book_path: /web/fundamentals/_book.yaml

{# wf_updated_on: {{ {
  const d = new Date();
  const month = d.getMonth() + 1;
  const paddedMonth = (month<10?'0':'')+month;
  const day = d.getDate();
  const paddedDay = (day<10?'0':'')+day;
  out += `${d.getFullYear()}-${paddedMonth}-${paddedDay}`;
} }}#}
{# wf_published_on: 2017-04-06 #}
{# wf_blink_components: Blink>DOM #}

# HowTo: Components – <{{=it.title}}> {: .page-title }

{% include "web/_shared/contributors/ewagasperowicz.html" %}
{% include "web/_shared/contributors/robdodson.html" %}
{% include "web/_shared/contributors/surma.html" %}

<link rel="stylesheet" href="main.css">

{{=it.readFile(`elements/${it.title}/README.md`)}}

## Demo {: #demo }
{% framebox height="auto" width="100%" class="demo" suppress_site_styles="true" %}
{{=it.readFile(`elements/${it.title}/demo.html`).replace(/\{%PATH%\}/g, '/web/fundamentals/architecture/howto-components')}}

<script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/d5b7ca65/webcomponents-sd-ce.js"></script>
<script>
  devsite.framebox.AutoSizeClient.initAutoSize(true);
  (function() {
    {{=it.readFile(`elements/${it.title}/${it.title}.js`).replace(/\{%PATH%\}/g, '/web/fundamentals/architecture/howto-components')}}
  })();
</script>
</html>

{% endframebox %}

## Example usage {: #usage }
<ul class="literate demo" id="{{=it.title}}_demo">
{{ for (let section of it.demoSections) { }}
<li class="{{=section.commentType.toLowerCase()}} {{? it.isEmpty(section.commentText) && it.isEmpty(section.codeText)}}empty{{?}}">
<div class="literate-text {{? it.isEmpty(section.commentText)}}empty{{?}}">{{=it.markdown(section.commentText)}}</div>
<pre><code class="literate-code {{? it.isEmpty(section.codeText)}}empty{{?}}">{{=it.indentLines(it.escape(section.codeText))}}</code></pre>
</li>
{{ } }}
</ul>

## Code {: #code }
<ul class="literate code" id="{{=it.title}}_impl">
  {{ for (let section of it.sections) { }}
<li class="{{=section.commentType.toLowerCase()}} {{? it.isEmpty(section.commentText) && it.isEmpty(section.codeText)}}empty{{?}}">
<div class="literate-text {{? it.isEmpty(section.commentText)}}empty{{?}}">{{=it.markdown(section.commentText)}}</div>
<pre><code class="literate-code {{? it.isEmpty(section.codeText)}}empty{{?}}">{{=it.indentLines(it.escape(section.codeText))}}</code></pre>
</li>
{{ } }}
</ul>
