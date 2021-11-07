# 12. 쿠버네티스 API 서버 보안

## 1. 인증 이해

API 서버가 요청을 받으면 인증 플러그인 목록을 거치면서 요청이 전달, 각 인증 플러그인이 요청을 검사  
인증 플러그인은 사용자 이름, ID와 클라이언트가 속한 그룹을 API 코어 서버에 반환  
API 서버는 나머지 인증 플러그인의 호출을 중지, 인가 단계 진행

인증 플러그인

- 클라이언트의 인증서
- HTTP 헤더로 전달된 인증 토큰
- 기본 HTTP 인증
- 기타

### 1.1 사용자와 그룹

#### 사용자

- 실제 사람
  - SSO와 같은 외부 시스템에 의해 관리
- 파드
  - 서비스 어카운트 메커니즘을 사용, 클러스터에 서비스 어카운트 리소스로 생성되고 관리

#### 그룹

개별 사용자에게 권한을 부여하지 않고 한 번에 여러 사용자에게 권한을 부여하는데 사용

- system:unauthenticated - 어떠한 인증 플러그인에서도 클라이언트 인증 불가
- system:authenticated - 성공적으로 인증된 사용자에게 자동으로 할당
- system:serviceaccounts - 시스템의 모든 서비스어카운트를 포함
- system:serviceaccounts:<namespace> - 특정 네임스페이스의 모든 서비스어카운트를 포함

### 1.2 서비스어카운트 소개

모든 파드는 실행 중인 애플리케이션의 아이덴티티를 나타내느 서비스어카운트와 연결되어 있음  
`system:serviceaccount:<namespace>:<service account name>`  
서비스 어카운트는 파드 내부에서 실행되는 애플리케이션이 API 서버에 자신을 인증하는 방법, 이 과정에서 애플리케이션은 서비스어카운트의 토큰을 요청에 전달

#### 서비스어카운트 리소스

개별 네임스페이스로 범위가 지정됨  
각 네임스페이스마다 default 서비스어카운트가 자동으로 생성   
각 파드는 파드의 네임스페이스에 있는 하나의 서비스어카운트와 연계

#### 서비스어카운트가 인가와 어떻게 밀접하게 연계돼 있는지 이해하기

### 1.3 서비스어카운트 생성

클러스터 보안을 위해 default 서비스어카운트가 아닌 추가 서비스어카운터를 생성  

```bash
$ kubectl create serviceaccount foo
serviceaccount/foo created
$ kubectl describe sa foo
Name:                foo
Namespace:           default
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>  # 서비스어카운트를 사용하는 파드에 자동으로 추가되는 필드 (지정된 값이 있을 떄)
Mountable secrets:   foo-token-cnflf
Tokens:              foo-token-cnflf  # 인증 토큰, 첫 번째 토큰이 컨테이너에 마운트 됨
Events:              <none>
$  kubectl describe secret foo-token-cnflf
Name:         foo-token-cnflf
Namespace:    default
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: foo
              kubernetes.io/service-account.uid: 76f168c3-2097-4fac-9930-e049d3dbaab5

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1111 bytes
namespace:  7 bytes
token:      eyJhbGciOiJS...
```

#### 서비스어카운트의 마운트 가능한 시크릿 이해

`kubernetes.io/enforce-mountable-secrets="true "`   
어노테이션을 포함하면 파드가 서비스어카운트의 마운트 가능한 시크릿 목록에 있는 시크릿만 마운트

#### 서비스어카운트의 이미지 풀 시크릿 이해

프라이빗 이미지 레포지터리에서 컨테이너 이미지를 가져오는데 필요한 자격증명을 갖고 있는 시크릿

```bash
$ cat sa-image-pull-secrets.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
imagePullSecrets:
- name: my-dockerhub-secret

```

각각의 파드가 어떤 이미지 풀 시크릿을 사용할 수 있는지 결정하는게 아닌 모든 파드에 특정 이미지 풀 시크릿을 자동으로 추가

### 1.4 파드에 서비스어카운트 할당

파드 정의의 `spec.service.AccountName` 필드에서 서비스어카운트 이름을 설정  

#### 사용자 정의 서비스어카운트를 사용하는 파드 생성

```bash
$ cat curl-custom-as.yaml
apiVersion: v1
kind: Pod
metadata:
  name: curl-custom-sa
spec:
  serviceAccountName: foo
  containers:
  - name: main
    image: tutum/curl
    command: ["sleep", "9999999"]
  - name: ambassador
    image: luksa/kubectl-proxy:1.6.2

$ kubectl apply -f curl-custom-as.yaml
pod/curl-custom-sa created
$ kubectl exec -it curl-custom-sa -c main -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
eyJhbGciOiJS...
```

#### API 서버와 통신하기 위해 사용자 정의 서비스어카운트 토큰 사용

```bash
$ kubectl exec -it curl-custom-sa -c main -- curl localhost:8001/api/v1/pods
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "resourceVersion": "260246"
  },
  "items": [
    {
      "metadata": {
        "name": "kubia-manual",
        ...
```

클러스터가 적절한 인가를 사용하지 않는 경우 default 서비스어카운트만으로 모든 작업을 수행할 수 있으므로 추가적인 서비스어카운트를 생성하고 사용하는 것은 의미가 없음

<br>

## 2. 역할 기반 액세스 제어로 클러스터 보안

```bash
$ kubectl create serviceaccount foo
serviceaccount/foo created
$ kubectl describe sa foo
Name:                foo
Namespace:           default
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>  # 서비스어카운트를 사용하는 파드에 자동으로 추가되는 필드 (지정된 값이 있을 떄)
Mountable secrets:   foo-token-cnflf
Tokens:              foo-token-cnflf  # 인증 토큰, 첫 번째 토큰이 컨테이너에 마운트 됨
Events:              <none>
$  kubectl describe secret foo-token-cnflf
Name:         foo-token-cnflf
Namespace:    default
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: foo
              kubernetes.io/service-account.uid: 76f168c3-2097-4fac-9930-e049d3dbaab5

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1111 bytes
namespace:  7 bytes
token:      eyJhbGciOiJS...
$ cat curl-custom-as.yaml
apiVersion: v1
kind: Pod
metadata:
  name: curl-custom-sa
spec:
  serviceAccountName: foo
  containers:
  - name: main
    image: tutum/curl
    command: ["sleep", "9999999"]
  - name: ambassador
    image: luksa/kubectl-proxy:1.6.2

$ kubectl apply -f curl-custom-as.yaml
pod/curl-custom-sa created
$ kubectl exec -it curl-custom-sa -c main -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
eyJhbGciOiJS...
$ kubectl exec -it curl-custom-sa -c main -- curl localhost:8001/api/v1/pods
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "resourceVersion": "260246"
  },
  "items": [
    {
      "metadata": {
        "name": "kubia-manual",
        ...
```

