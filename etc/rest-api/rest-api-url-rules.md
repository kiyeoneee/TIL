# Rest API URL Rules

## 목차

* [URL Rules](#URL_Rules)
  * [마지막에 `/` 를 포함하지 않는다](#마지막에-`/`-를-포함하지-않는다)
  * [UnderBar(`_`) 대신 dash(`-`)를 사용한다](#UnderBar(`_`)-대신-dash(`-`)를-사용한다)
  * [소문자를 사용한다](#소문자를-사용한다)
  * [행위(method)는 URL에 포함하지 않는다](#행위(method)는-URL에-포함하지-않는다)
  * [컨트롤 자원의 URL은 예외적으로 동사를 허용한다](#컨트롤-자원의-URL은-예외적으로-동사를-허용한다)
  * [파일 확장자는 URL에 포함하지 않는다](#파일-확장자는-URL에-포함하지-않는다)

<br>

---

## URL Rules

### 마지막에 `/` 를 포함하지 않는다

**Bad :**

``````
http://api.test.com/users/
``````

**Good :**

``````
http://api.test.com/users
``````

<br>

### UnderBar(`_`) 대신 dash(`-`)를 사용한다

Dash의 사용도 최대한 지양한다.

**Bad :**

``````
http://api.test.com/users/post_comments
``````

**Good :**

``````
http://api.test.com/users/post-comments
``````

<br>

### 소문자를 사용한다

**Bad :**

``````
http://api.test.com/users/postComments
``````

**Good :**

``````
http://api.test.com/users/post-comments
``````

<br>

### 행위(method)는 URL에 포함하지 않는다

**Bad :**

``````
POST http://api.test.com/users/1/delete-post/1
``````

**Good :**

``````
DELETE http://api.test.com/users/1/posts/1
``````

<br>

### 컨트롤 자원의 URL은 예외적으로 동사를 허용한다

리소스를 조작하는게 아닌, 직접 function을 실행하는 것 같이 컨트롤 자원을 이용하는 경우 URL에 동사를 사용해도 괜찮다.

**Bad :**

``````
http://api.test.com/posts/duplicating
``````

**Good :**

``````
http://api.test.com/posts/duplicate
``````

<br>

### 파일 확장자는 URL에 포함하지 않는다

응답받을 리소스의 포맷을 나타내기 위한 파일 확장자는 URL에 포함시키지 않고, Accept header를 사용한다.

**Bad :**

``````
GET http://api.test.com/posts/contents.txt
``````

**Good :**

``````
GET /posts/contents HTTP/1.1
Host: api.test.com
Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8 
``````

