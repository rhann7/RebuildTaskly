<!doctype html>
<html>

<head>
    <meta charset="utf-8" />
    <style>
        @page {
            margin: 20mm;
        }

        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        .article {
            page-break-inside: avoid;
        }

        .page-break {
            page-break-after: always;
            break-after: page;
            height: 1px;
        }
    </style>
</head>

<body>
    @foreach($articles as $article)
    <div class="article">
        <span>{</span>
        <h2>title        : {{ $article->name }},</h2>
        <div>description : {!! $article->detail->description !!}</div>
        <span>}</span>
    </div>
    <div class="page-break"></div>
    @endforeach
</body>

</html>