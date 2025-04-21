<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Booster - GitHub README</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
        }
        .badge {
            display: inline-block;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .feature-card {
            border-left: 4px solid #0a66c2;
            background-color: #f9fafb;
        }
        .timeline-item {
            position: relative;
            padding-left: 28px;
        }
        .timeline-item:before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #0a66c2;
            margin-top: 6px;
        }
        .timeline-item:after {
            content: "";
            position: absolute;
            left: 5px;
            top: 22px;
            width: 2px;
            height: calc(100% - 22px);
            background: #0a66c2;
        }
        .timeline-item:last-child:after {
            display: none;
        }
        code {
            font-family: Menlo, Monaco, 'Courier New', monospace;
        }
        .hero-pattern {
            background-color: #0a66c2;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
