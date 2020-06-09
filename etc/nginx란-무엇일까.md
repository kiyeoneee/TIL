# Nginx를 이용해 SpringBoot Application을 80 port로 프록시

SpringBoot Application을 80 port로 사용하고 싶은데, 리눅스 환경에서 80, 443과 같은 포트는 루트 권한으로 사용이 가능하다.  
SpringBoot application의 내장 톰켓이 해당 포트를 사용할 수 있도록 sudo 권한을 사용해 서비스를 올리는 것 보다 proxy 서버를 올리는게 더욱 용이하므로 Nginx를 사용한 내용을 정리한다.  

<br>

## Nginx 란?

Apache의 1만명 규모 클라이언트의 동시 접속을 다루는 기술적인 이슈를 해결하기 위해 만든 Event-driven 구조의 오픈소스 서버 프로그램이다. 
일반적인 HTTP 웹서버의 역할 외에도 proxy, reverse proxy를 제공한다. 

<br>

## 설치 및 설정

### Centos6

서버의 권한 이슈로 sudo 명령어를 사용

#### 설치

```shell
$  sudo yum install nginx
```

<br>

#### 라우팅 설정

yum으로 nginx를 설치하게 되면 `/etc/nginx` 경로에 설치된다.  
nginx 디렉토리 중 `conf.d`디렉토리 하위의 `default.conf ` 파일을 변경하여 SpringBoot Application을 80 port로 포팅 한다. 

```shell
$ vi /etc/nginx/conf.d/default.conf
# 아래와 같이 변경
# The default server
#

server {
#    listen       80 default_server; 
#    listen       [::]:80 default_server;
    listen       80;
    server_name  _;
    root         /usr/share/nginx/html;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
#				SpringBoot application을 매핑
        proxy_pass http://localhost:9100;
#				java application은 requestUrl을 실제 client가 조회하는 url로 받기 위한 설정
        proxy_set_header Host $http_host;
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }

}
```

##### **server 블럭**  

도메인 단위의 1차 라우팅에 대한 설정을 담당한다..

* listen : 서버 블록 정의 중 해당 서버에서 라우팅 할 특정 port를 정의하는 필드
  * default_server : 여러개의 server 블록을 작성할 때 default_server는 프로토콜 별로 단 하나의 server 블록에만 존재해야 합니다. 이 설정은 별도로 지정하지 않은 도메인으로 들어오는 다른 모든 요청에 대해서 해당 server 블록이 처리함을 의미한다.
* server_name : 어떤 도메인을 라우팅 할지에 대한 필드

<br>

##### location 블럭  

URI 리퀘스트의 path prefix의 매칭을 확인하여 적절한 어플리케이션으로 매핑한다.

* proxy_pass : 실질적으로 요청 할 서비스를 명시하는 필드

<br>

#### Nginx 실행

아래의 명령어로 nginx 명령어 만으로 실행이 완료되고 별다른 알람 없이 실행이 완료되면 ps 명령어로 한번 더 확인 해 준다. 

```shell
$ sudo nginx
$ ps -ef | grep nginx
root     20270     1  0 16:36 ?        00:00:00 nginx: master process nginx
nginx    20271 20270  0 16:36 ?        00:00:01 nginx: worker process
nginx    20272 20270  0 16:36 ?        00:00:01 nginx: worker process
nginx    20273 20270  0 16:36 ?        00:00:01 nginx: worker process
```

<br>

#### Nginx 기타 운영

##### Nginx 중지

```shell
$ nginx -s stop
```

##### Nginx 리로드

```shell
$ nginx -s reload
```

##### Nginx 체크

```shell
$ nginx -s check
```