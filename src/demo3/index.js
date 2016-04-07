const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const _ = require('underscore');
const syncrequest = require('sync-request');
const eventproxy = require('eventproxy');
const async = require('async');

const app = express();

app.get('/', function(req, res, next) {
  res.send("多种方式实现简单的网页内容抓取");
});

app.get('/meizitu/:id', function(request, response) {
  superagent
    .get('http://www.meizitu.com/a/' + request.params.id + '.html')
    .end(function(err, sres) {
      if (err)
        return next(err);
      var $ = cheerio.load(sres.text);
      var items = [];
      $('.postContent p img').each(function(idx, element) {
        var $element = $(element);
        var img = '<img src="' + $element.attr('src') + '" />'
        items.push(img);
      });
      var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        items.toString() +
        '</body>' +
        '</html>';
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(body);
      response.end();
    });
});

//同步方式处理多个数据请求
app.get('/mzitusync/:id', function(request, response) {
  superagent
    .get('http://www.mzitu.com/' + request.params.id)
    // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
    .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
    .end(function(err, sres) {
      if (err)
        console.log(err);
      var $ = cheerio.load(sres.text);
      var items = [];
      $('.main-image img').each(function(idx, element) {
        var $element = $(element);
        var img = '<img src="' + $element.attr('src') + '" />'
        items.push(img);
      });

      var maxIndex = 0;
      $('.pagenavi span').each(function(idx, element) {
        var $element = $(element);
        if (_.isNumber(parseInt($element.text())) && !_.isNaN(parseInt($element.text()))) {
          //console.log($element.text());
          if (parseInt($element.text()) > maxIndex)
            maxIndex = parseInt($element.text());
        }
      });

      var count = 1;
      for (i = 2; i <= maxIndex; i++) {
        var link = 'http://www.mzitu.com/' + request.params.id + '/' + i;
        console.log(i);
        var res = syncrequest('GET', link, {
          'headers': {
            'user-agent': 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5'
          }
        });
        var $$ = cheerio.load(res.getBody());
        $$('.main-image img').each(function(idx, element) {
          var $element = $$(element);
          var img = '<img src="' + $element.attr('src') + '" />'
          items.push(img);
        });
        function sleep(milliSeconds) {
          var startTime = new Date().getTime();
          while (new Date().getTime() < startTime + milliSeconds);
        }
        sleep(500);
      }

      var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        items.toString() +
        '</body>' +
        '</html>';
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(body);
      response.end();
    });
});

//异步方式处理多个数据请求，利用计数器
app.get('/mzitu/:id', function(request, response) {
  superagent
    .get('http://www.mzitu.com/' + request.params.id)
    // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
    .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
    .end(function(err, sres) {
      if (err)
        console.log(err);
      var $ = cheerio.load(sres.text);
      var items = [];
      $('.main-image img').each(function(idx, element) {
        var $element = $(element);
        var img = '<img src="' + $element.attr('src') + '" />'
        items.push(img);
      });
      var maxIndex = 0;
      $('.pagenavi span').each(function(idx, element) {
        var $element = $(element);
        if (_.isNumber(parseInt($element.text())) && !_.isNaN(parseInt($element.text()))) {
          //console.log($element.text());
          if (parseInt($element.text()) > maxIndex)
            maxIndex = parseInt($element.text());
        }
      });
      
      var count = 1;
      for (i = 2; i <= maxIndex; i++) {
        var link = 'http://www.mzitu.com/' + request.params.id + '/' + i;
        superagent
          .get(link)
          // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
          .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
          .end(function(err, sres) {
            if (err)
              console.log(err);
            count++;
            var $$ = cheerio.load(sres.text);
            $$('.main-image img').each(function(idx, element) {
              var $element = $$(element);
              var img = '<img src="' + $element.attr('src') + '" />'
              items.push(img);
            });
            handle();
          });
      }

      function handle() {
        if (count === maxIndex) {
          var body = '<html>' +
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html; ' +
            'charset=UTF-8" />' +
            '</head>' +
            '<body>' +
            items.toString() +
            '</body>' +
            '</html>';
          response.writeHead(200, { "Content-Type": "text/html" });
          response.write(body);
          response.end();
        } else {
          console.log(count);
        }
      }
    });
});

//异步方式处理多个数据请求，利用eventproxy
app.get('/mzituep/:id', function(request, response) {
  superagent
    .get('http://www.mzitu.com/' + request.params.id)
    // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
    .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
    .end(function(err, sres) {
      if (err)
        console.log(err);
      var $ = cheerio.load(sres.text);
      var items = [];
      $('.main-image img').each(function(idx, element) {
        var $element = $(element);
        var img = '<img src="' + $element.attr('src') + '" />'
        items.push(img);
      });

      var maxIndex = 0;
      $('.pagenavi span').each(function(idx, element) {
        var $element = $(element);
        if (_.isNumber(parseInt($element.text())) && !_.isNaN(parseInt($element.text()))) {
          if (parseInt($element.text()) > maxIndex)
            maxIndex = parseInt($element.text());
        }
      });
      var ep = new eventproxy();
      ep.after('topic_html', maxIndex, function(list) {
        console.log(list)
        var body = '<html>' +
          '<head>' +
          '<meta http-equiv="Content-Type" content="text/html; ' +
          'charset=UTF-8" />' +
          '</head>' +
          '<body>' +
          list.toString() +
          '</body>' +
          '</html>';
        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(body);
        response.end();
      });
      for (i = 1; i <= maxIndex; i++) {
        var link = 'http://www.mzitu.com/' + request.params.id + '/' + i;
        superagent
          .get(link)
          // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
          .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
          .end(function(err, res) {
            if (err)
              console.log(err);
            var $$ = cheerio.load(res.text);
            $$('.main-image img').each(function(idx, element) {
              var $element = $$(element);
              var img = '<img src="' + $element.attr('src') + '" />'
              items.push(img);
              console.log('fetch successful' + img);
              ep.emit('topic_html', img);
            });
          });
      }
    });
});

//异步方式处理多个数据请求，利用async
app.get('/mzituasync/:id', function(request, response) {
  superagent
    .get('http://www.mzitu.com/' + request.params.id)
    // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
    .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
    .end(function(err, sres) {
      if (err)
        console.log(err);
      var $ = cheerio.load(sres.text);
      var items = [];
      $('.main-image img').each(function(idx, element) {
        var $element = $(element);
        var img = '<img src="' + $element.attr('src') + '" />'
        items.push(img);
      });

      var maxIndex = 0;
      $('.pagenavi span').each(function(idx, element) {
        var $element = $(element);
        if (_.isNumber(parseInt($element.text())) && !_.isNaN(parseInt($element.text()))) {
          if (parseInt($element.text()) > maxIndex)
            maxIndex = parseInt($element.text());
        }
      });

      var fetchUrl = function(url, callback) {
        superagent
          .get(url)
          // 如果有些网站需要验证header里面的"User-Agent"，则进行如下设置
          .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
          .end(function(err, res) {
            if (err)
              console.log(err);
            var $$ = cheerio.load(res.text);
            $$('.main-image img').each(function(idx, element) {
              var $element = $$(element);
              var img = '<img src="' + $element.attr('src') + '" />'
              //console.log('fetch successful ' + img);
              callback(null, img);
            });
          });
      }

      var urls = [];
      for (i = 1; i <= maxIndex; i++) {
        urls.push('http://www.mzitu.com/' + request.params.id + '/' + i);
      }

      async.mapLimit(urls, 5, function(url, callback) {
        fetchUrl(url, callback);
      }, function(err, result) {
        var body = '<html>' +
          '<head>' +
          '<meta http-equiv="Content-Type" content="text/html; ' +
          'charset=UTF-8" />' +
          '</head>' +
          '<body>' +
          result.toString() +
          '</body>' +
          '</html>';
        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(body);
        response.end();
      });
    });
});


app.listen(3001, function() {
  console.log('server running on port 3001!');
});