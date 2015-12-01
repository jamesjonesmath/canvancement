# Canvas Data PHP Code
## API
The [API](api.php) code creates a new class called **CanvasDataAPI** that includes allows you to access the Canvas Data API.

In your code, you include the API and create a new object of the class. 
There are methods for each of the API calls, some, like the get_dump() method allow you to specify 'allow' or 'limit' parameters.

```php
<?php
require(__DIR__ . '/api.php');
// Create a new instance of the CanvasDataAPI object
// Replace API_KEY and API_SECRET by their values
$CD = new CanvasDataAPI(API_KEY, API_SECRET);
// When you need to access the API, you do it like this (the limit parameter is optional)
// A JSON object is returned
$dumps = $CD->get_dump(['limit' => 100]);
$latest = $CD->get_file_latest();
$schema = $CD->get_schema_latest();
```
