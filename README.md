# KnowSheet-REPL
A Read-Eval-Print-Loop (REPL) shell to demonstrate the KnowSheet Bricks C++ syntax.

## Installation

[Node.js](http://nodejs.org/) v0.12.0 is required to install and run the REPL.

```bash
git clone https://github.com/KnowSheet/KnowSheet-REPL.git
cd KnowSheet-REPL
npm install
```

## Usage

Start the REPL from the terminal:
```bash
node run
```
The command prompt `KnowSheet> ` will appear.

... or evaluate one expression from the command-line:
```bash
echo 'HTTP(GET("http://httpbin.org/get?query=1")).body' | node run
```

... or evaluate and pass the result to another command:
```bash
echo 'HTTP(GET("http://httpbin.org/get?query=1")).body' | node run | cat
```

Override the default prompt:
```bash
node run --prompt 'Bricks> '
```
The command prompt `Bricks> ` will appear.

### HTTP client

Perform an HTTP GET request and print the response:
```
KnowSheet> HTTP(GET("http://httpbin.org/get?query=1")).body
```

Perform an HTTP POST request and print the response:
```
KnowSheet> HTTP(POST("http://httpbin.org/post", "BODY", "text/plain")).body
```

Allow redirects:
```
KnowSheet> HTTP(GET("http://httpbin.org/redirect/5").AllowRedirects()).body
```

Provide a custom User-Agent:
```
KnowSheet> HTTP(GET("http://httpbin.org/get").UserAgent("KnowSheet-REPL/1.0.0")).body
```

Provide extra HTTP headers:
```
KnowSheet> HTTP(GET("http://httpbin.org/get?query=1", HTTPHeaders().Set("Custom", "Header"))).body
KnowSheet> HTTP(POST("http://httpbin.org/post", "BODY", "text/plain", HTTPHeaders().Set("Custom", "Header"))).body
```

### HTTP server

Start an HTTP server on port `2015`, register an endpoint `/ping` and request it:
```
KnowSheet> HTTP(2015).Register("/ping", [](Request r) { r("pong"); });
KnowSheet> HTTP(GET("http://localhost:2015/ping")).body;
```
<sup>The handler lambda syntax mimics C++11 to a certain extent. No full support guaranteed.</sup>

The server accepts connections until the REPL process exits.

### JSON

POST a JSON-encoded instance of type `DemoObject`:
```
KnowSheet> HTTP(POST("http://httpbin.org/post", DemoObject())).body
```
<sup>The syntax mimics C++ Bricks exactly, as long as `DemoObject` is defined as a serializable type.</sup>

Parse a JSON response into an object, get a field from it:
```
KnowSheet> ParseJSON(HTTP(GET("http://httpbin.org/get?query=1")).body).args
```
<sup>The syntax deviates from C++ Bricks which requires a defined type for the output instance: either `T output = ParseJSON<T>(string);` or `T output; ParseJSON(string, output);`.</sup>

### Advanced examples

Chain requests:
```
KnowSheet> ParseJSON(HTTP(POST("http://httpbin.org/post", ParseJSON(HTTP(GET("http://httpbin.org/get?query=1")).body))).body)
```
