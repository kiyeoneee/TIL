

# Linux Command

Linux 서버에서 작업을 하면서 사용하는 명령어의 특징과 옵션 등을 정리한다.

## history

접속자가 사용한 Shell 명령어 기록을 확인하기 위한 명령어
히스토리 기록은 ~/.bash_history 에 저장됨
이때 기록은 사용자가 shell에 입력한 내용을 바로 파일에 저장하지 않고 메모리에 기억하다가 사용자가 로그아웃을 하면 메모리상에 있는 히스토리를 파일에 기록

```bash
# n개 까지의 기록을 출력
$ history n

# 히스토리 번호 n부터 m까지의 기록을 출력
$ fc -l n m

# 히스토리 명령어의 결과값을 파일로 저장
$ history -w path/filename

# 메모리상의 히스토리 기록을 초기화
$ history -c

# 특정 키워드를 가진 히스토리를 조회
$ history | grep keyword

# 바로 앞의 명령어를 다시 실행
$ !!

# 히스토리 중 n번호를 가진 명령어를 다시 실행
$ !n

# 히스토리 중 지정한 문자를 가장 최근에 사용한 명령어 실행
$ !his
```

 

---

## ps 명령어

processor status를 의미하는 ps 명령어는 명령어를 입력하는 순간 동작되고 있는 프로세서의 상태를 사용자가 점검하기 위한 명령어 (실시간으로 프로세서들의 상태를 확인하고 싶으면 top 명령어를 사용)

#### 옵션 입력

ps 명령은 옵션 입력 방법이 bsd 스타일과 unix 스타일, gnu 스타일로 나뉨

bsd 스타일 :  'ps aux'와 같이 대쉬가 없는 스타일  
unix 스타일 : 'ps -ef' 처럼 옵션앞에 대쉬를 넣어 옵션 임을 표시하는 스타일  
gnu 스타일 :  대쉬를 두개 넣는 스타일로 'ps --help' 처럼 사용  
동일하게 문자 u를 사용하는 옵션이라도 대쉬의 유무에 따라 의미가 달라짐

```bash
# 현재 시스템에서 돌고있는 모든 프로세스를 표시
$ ps ax
$ ps -e

# 더 자세한 프로세스의 정보를 표시
$ ps aux
$ ps -ef
```

<br>

#### 출력된 결과의 각 필드의 의미

USER : 프로세서를 실행시킨 소유자의 계정을 보여준다.  
PID : 프로세서 ID, 각 프로세서를 구분하기 위한 고유의 ID  
%CPU : 프로세스의 CPU 사용률   
%MEM - 프로세스의 메모리 사용률  
RSS : 프로세서에 의해 사용되는 실제 메모리의 용량(K byte 단위)   
TT : 프로세서의 제어 터미널(t3=/dev/tty3)   
STAT : 프로세서의 상태  
SZ : 프로세서의 자료와 스텍 크기의 (K byte 단위)   
TIME : 현재까지 사용된 CPU의 시간(분,초)   
START : 프로세서가 시작된 시간  
STAT : 프로세서의 상태  
COMMAND : 명령어의 이름  

 

---

## curl 명령어
curl [options...] <url>

http 메세지를 쉘 상에서 요청하여 결과를 확인하는 명렁어 (REST api를 날릴 수 있도록 해주는 명령어)

```bash
# 응답 헤더 출력 옵션 (출력 default : 응답 본문)
curl -i http://www.daum.net

# 중간 처리 과정, 오류 메시지, 요청 메시지와 응답 메시지를 헤더와 본문을 포함해 전체 출력
curl -v http://www.daum.net

# 요청 메소드를 지정 (default : GET)
curl -X GET http://www.daum.net/~
curl -X POST http://www.daum.net/~
curl -X PUT http://www.daum.net/~

# 요청 헤더를 지정
curl -H http://www.daum.net

# 요청 본문을 지정 (default : 요청 본문 없음)
curl -d http://www.daum.net
```

명령어를 사용할 떄 URL에 사용할 수 없는 문자가 포함될 경우 URL 인코드를 해 줘야 함
`curl -X GET --data-urlencode "id=1000&category=post" http://www.daum.net/api/data`
URL쿼리 부분은 위와 같이 --data-urlencode 옵션을 이용하여 URL 인코딩하여 요청이 가능

 

---

## remote 서버에 여러개 command 날리기

```bash
ssh server_name << "EOF"  # EOF가 아니어도 command의 끝을 알릴 때 쓸 메세지를 설정
command1
command2
EOF
```

### 해결하지 못한 궁금증
- 특정 폴더에 들어가서 여러개의 커맨드를 날리고 싶은데 cd command로 폴더를 이동하고나서 이후의 커맨드가 안먹힘

  

---

## Sed

필터링과 텍스트를 변환하는 스트림 편집기

- 원본 변화 없이, 결과값를 변환하여 출력

```bash
$sed 's/찾을텍스트/바꿀텍스트/' 파일명

#파일이 아니라 echo 값도 변환 가능
$echo "string" | sed 's/찾을텍스트/바꿀텍스트/'
```

 

####정규식

- []: 한문자 매치
- ^: 라인 맨앞
- $: 라인 끝
- &: 검색문자열 치환
- \<: 단어의 시작
- \>: 단어의 끝
- x{m,n}: m,n 구간 반복

 

#### 연산자

- [범위]/p: 지정 범위 출력
- [범위]/d: 지정 범위 삭제
- [범위]/문자1/문자2: 지정된 범위의 처음 나타난 문자를 문자2로
- s/문자1/문자2/: 문자1을 2로
- g: 모든 라인에 적용





mkdir http://blog.tordeu.com/?p=262