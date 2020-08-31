# Elasticsearch Swap off

Elasticsearch를 올려놓은 서버가 swap 메모리를 풀로 다 쓰는 문제가 발생했다. 찾아보니 설정없이 Elasticsearch를 실행하면 swap 메모리를 사용하므로 swap off 설정을 진행하며 발생한 이슈 해결과정을 정리한다.

---

1. bootstrap.memory_lock 설정 활성화    
  
  ```bash
  $ vi {elasticsearch_path}/config/elasticsearch.yml 
  
  # 아래와 같이 수정한다.
  # ----------------------------------- Memory -----------------------------------
  #
  # Lock the memory on startup:
  #
  bootstrap.memory_lock: true
  #
  # Make sure that the heap size is set to about half the memory available
  # on the system and that the owner of the process is allowed to use this
  # limit.
  #
  # Elasticsearch performs poorly when the system is swapping the memory.
  #
  ```

<br>

bootstrap.memory_lock 설정을 활성화한 후 elasticsearch를 실행하였는데 아래와 같은 로그를 남기며 elasticsearch가 정상적으로 구동하지 않는 문제가 발생했다.

```
[2020-05-11T13:51:29,683][WARN ][o.e.b.JNANatives         ] [server] This can result in part of the JVM being swapped out.
[2020-05-11T13:51:29,683][WARN ][o.e.b.JNANatives         ] [server] Increase RLIMIT_MEMLOCK, soft limit: 65536, hard limit: 65536
[2020-05-11T13:51:29,683][WARN ][o.e.b.JNANatives         ] [server] These can be adjusted by modifying /etc/security/limits.conf, for example:
    # allow user 'user' mlockall
    user soft memlock unlimited
    user hard memlock unlimited
...
...
[2020-05-11T15:00:31,219][ERROR][o.e.b.Bootstrap          ] [server] node validation exception
[1] bootstrap checks failed
[1]: memory locking requested for elasticsearch process but memory is not locked
[2020-05-11T15:00:31,221][INFO ][o.e.n.Node               ] [server] stopping ...
[2020-05-11T15:00:31,272][INFO ][o.e.n.Node               ] [server] stopped
[2020-05-11T15:00:31,272][INFO ][o.e.n.Node               ] [server] closing ...
[2020-05-11T15:00:31,287][INFO ][o.e.n.Node               ] [server] closed
```

위와 같은 로그를 남기며 정상적으로 실행이 안된다. 이때 아래의 절차를 수행한다.

<br>

2. user의 메모리 락 제한 없애기     
   위의 로그에서 나온 allow user 'user' mlockall 에서 user 부분의 사용자 이름에 대해 메모리락 제한을 없애준다.

   ```bash
   $ sudo vi /etc/security/limits.conf
   
   #<domain>      <type>  <item>         <value>
   
   #ftp             hard    nproc           0
   #@student        -       maxlogins       4
   
   user            soft     memlock         unlimited
   user            hard     memlock         unlimited
   # 아래처럼 한 줄로 변경해도 가능하다.
   # user            -        memlock         unlimited 
   # End of file
   ```

<br>

해당 설정 후 elasticsearch를 실행했을 때 똑같은 에러가 발생하였다.  
이러한 문제는 현재 로그인 세션에서는 limits.conf 설정값이 정상적으로 반영되지 않아서 똑같은 이슈가 발생하는 것이다.  

```bash
$ ulimit -l
unlimited
```

위와 같은 결과가 나오지 않으면 해당 세션을 종료 후 다시 서버에 접속하여 다시 ulimit 설정값을 확인 후 unlimited 값이 정상적으로 나오면 elasticsearch를 실행시킨다.