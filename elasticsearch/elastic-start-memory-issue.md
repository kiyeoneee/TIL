# Elastic Search 실행 시 메모리 이슈

**ElasticSearch를 올려도 자꾸 죽는 문제가 발생**  
로그를 확인 해 보니 아래와 같은 로그가 발생하고 있었음

``` bash
max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```

<br>

### 해결 방법

kibana5 버전대의 문제라고 함

**max_map_count:**  

```
This file contains the maximum number of memory map areas a process may have. Memory map areas are used as a side-effect of calling malloc, directly by mmap and mprotect, and also when loading shared libraries.  
While most applications need less than a thousand maps, certain programs, particularly malloc debuggers, may consume lots of them, e.g., up to one or two maps per allocation.  
The default value is 65536.
```
vm.max_map_count 이 설정이 디폴트로 되어 있는 경우 bootstrap을 올리는데 문제가 생기기도 해서 vm.max_map_count=262144으로 /etc/sysctl.config에서 변경해 줘야 함 (모든 클러스터)
