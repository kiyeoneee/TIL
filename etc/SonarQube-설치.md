---

## Trouble Shooting

### Java 버전 Issue

실행 시 아래와 같은 자바 버전 관련 이슈가 있었다.

```bash
WrapperSimpleApp: Encountered an error running main: java.lang.IllegalStateException: SonarQube requires Java 11 to run
java.lang.IllegalStateException: SonarQube requires Java 11 to run
        at com.google.common.base.Preconditions.checkState(Preconditions.java:508)
        at org.sonar.application.App.checkJavaVersion(App.java:94)
        at org.sonar.application.App.start(App.java:57)
        at org.sonar.application.App.main(App.java:98)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.tanukisoftware.wrapper.WrapperSimpleApp.run(WrapperSimpleApp.java:240)
        at java.lang.Thread.run(Thread.java:745)
<-- Wrapper Stopped
```

소나큐브 설치 당시 가장 최신버전인 `sonarqube-8.3.0.34182`을 다운받아서 세팅하는 과정에 발생 한 버그다.  
SonarQube는 내부적으로 검색을 위해 사용하는 ElasticSearch가 Java11 이상의 버전이 필요한데 현재 사용중인 서버에서는 Java8을 사용중이어서 발생하는 이슈이다.  
서버 전체의 자바 버전을 업그레이드 하기에는 서버에서 구동중인 서비스들이 있어서 Java11을 설치 한 뒤 설정파일에서 path를 변경하는 방법으로 이슈를 해결했다.

#### 해결 방법

> 1. Java 11 설치 및 압축 해제
>
>    ```bash
>    $ cd {Java11_directory_path}
>    $ curl -O https://download.java.net/java/GA/jdk11/9/GPL/openjdk-11.0.2_linux-x64_bin.tar.gz
>    $ tar -zxvf openjdk-11.0.2_linux-x64_bin.tar.gz
>    ```
>
> 2. SonarQube 설정 내 Java 경로 변경  
>
>    ```bash
>    $ cd {SonqrQube_path}/sonarqube-8.3.0.34182/conf
>    $ vi wrapper.conf
>    ```
>
>    가장 상단의 wrapper.java.command 값을 `{Java11_directory_path}/jdk-{버전}/bin/java`으로 변경 해 준다.
>
>    ![image-20200507121346145](/Users/kakao/Library/Application Support/typora-user-images/image-20200507121346145.png)

