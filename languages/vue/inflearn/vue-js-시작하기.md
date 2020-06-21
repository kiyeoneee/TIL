# Vue.js 시작하기

> https://www.inflearn.com/course/Age-of-Vuejs#description  
> 수업을 들으며 정리해놓으면 좋을 부분들을 정리하자📚

<br>

## 개발 환경 설정

### VSCode

```
- Vetur
- Night Owl
- Material Icon Theme
- Live Server
	Html 파일을 수정했을 때 수정 내역을 바로 보기 위해 필요한 플러그인
- ESLint
- Prettier
- Auto Close Tag
- Atom Keymap
```

<br>

## Vue.js 소개

### MVVM 모델에서의 Vue

MVVM 패턴의 뷰모델 레이어에 해당하는 View(화면)단 라이브러리

![image-20200619221040091](/Users/kakao/Library/Application Support/typora-user-images/image-20200619221040091.png)

* View
  * 사용자에게 보여지는 브라우저 화면
  * 화면의 요소인 HTML을 DOM을 이용해 자바스크립트로 조작
* ViewModel
  * DOM Listeners
    * 화면의 버튼 클릭 등의 이벤트 발생 인지
* Model
  * Java Script의 데이터가 바뀌었을 때 View Model의 Data Bindings을 이용해 View에 반영시킴

<br>

### 기존 웹 개발 방식(HTML, JAvascript)

#### VSCode에서 HTML 개발

* 기본 HTML 코드 생성
  * ! + tab
* div 태그의 선택자 
  * div#선택자id

<br>

### Reactivity 구현

웹개발 API 문서가 정리되어 있는 사이트 - https://developer.mozilla.org/ko/

vue.js의 대표적인 개념인 Reactivity 구현을 위해 Object.defineProperty API를 이용해 vue 객체를 선언해야 함

```javascript
Object.defineProperty('대상 객체', 객체의 속성, {
                      정의 할 내용
                      })

var viewModel = {};
Object.defineProperty(viewModel, 'str', {
  // 속성에 접근했을 때의 동작을 정의
  get: function() {
	},
  // 속성에 값을 할당했을 때의 동작을 정의
  set: function (newValue) {
    // 이렇게 설정해주면 값이 할당되면 바로 화면이 바뀜
    div.innerHTML = newValue;
	}
})
```

<br>

### Reactivity 구현

<br>

### Reactivity 코드 라이브러리화 하기

#### 즉시 실행함수

정의되자마자 즉시 실행되는 Javascript Function  

* 어플리케이션 로직에 스크립트 코드가 노출되지 않도록 함
* 변수의 유효범위 관리에 용이

<br>

### Hello Vue.js와 뷰 개발자 도구

![image-20200621121237093](/Users/kakao/Library/Application Support/typora-user-images/image-20200621121237093.png)

<br>

## 인스턴스

뷰로 개발할 때 필수로 생성해야 하는 코드

