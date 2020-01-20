# PageHit (file)

A page hit counter service which saves data in memory and backs up to a file every 10 seconds.

This is an example project for the purposes of demonstration only. It is not recommended for production use!

Execute `npm start` to start a web server at `http://localhost:3000/`

To test the service, open any HTML page in the `testpages` folder. A static file server can be started using:

```sh
cd testpages
npx small-static-server
```

Then load any page to test four methods of adding a hit counter:

* <http://localhost:8888/page-svg.html>
* <http://localhost:8888/page-jswrite.html>
* <http://localhost:8888/page-jsdefer.html>
* <http://localhost:8888/page-jsajax.html>
