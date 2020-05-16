# Stateless Object

코드리뷰 중 아래와 같은 질문을 받았다.

> 클래스가 서비스 형태로 사용되는 경우, 상태 정보를 가지고 있지 않은 무상태(stateless) 방식으로 만들면 어떤 장점이 있을까요?

구글링을 하다보니 [관련된 stackOverflow 질문글](https://stackoverflow.com/questions/9735601/what-is-stateless-object-in-java)이 있었다.   
질문에 대한 답변은 아래와 같다.

> Stateless object is an instance of a class without instance fields (instance variables). The class *may* have fields, but they are compile-time constants (static final).
>
> A very much related term is *immutable*. Immutable objects may have state, but it does not change when a method is invoked (method invocations do not assign new values to fields). These objects are also thread-safe.

간단히 정리해보자면, Stateless Object란 인스턴스 변수가 없는 객체를 말한다.



아래와 같은 코드는 Stateless Object이다.

```java
public class Car {
	void Car() {
    System.out.println("I'm car!");
	}
}
```

말그대로 인스턴스 변수가 없는 객채인데, 아래와 같은 컴파일 타임에 정의되어있고 변경되지 않는 상수를 가지는 경우도 Stateless Object라고 지칭할 수 있다.

```java
public class Car {
  static final String CAR_MESSAGE = "I'm car!";
  
  void Car() {
    System.out.println(CAR_MESSAGE);
  }
}
```

Stateless Object와 연관된 헷갈릴 수 있는 개념으로는 Immutable Object가 있다.  
객체지향 프로그래밍에서 Immutable Object는 상태를 바꿀 수 없는 객체이다. 

```java
public class Car {
  private static String message;
  
  void Car(String message) {
    this.message = message;
  }
  
  public void printMessage() {
    System.out.println(message);
  }
}
```

이와 같이 불변 객체는 상태가 한번 지정되면 바뀔 수 없지만 컴파일 시점에 값이 정의되는 것이 아니어서 Stateless Object라고 할 수는 없다.