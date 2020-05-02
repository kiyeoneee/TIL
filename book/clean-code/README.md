# Clean Code ([Robert C. Martin](https://en.wikipedia.org/wiki/Robert_C._Martin))

## 목차

1. [깨끗한 코드](#1장.-깨끗한-코드)
2. [의미 있는 이름](#2장.-의미-있는-이름)
3. [함수](#3장.-함수)
4. 주석

  

---

## 1장. 깨끗한 코드

### 보이스카우트 규칙

* 코드는 잘 짜기만 했을 때 끝나는 것이 아닌, 시간이 지나도 언제나 깨끗하게 유지해야 한다.
* 보이스카우트 규칙  
  ` 캠프장은 처음 왔을 때보다 더 깨끗하게 해놓고 떠나라.`

---

## 2장. 의미 있는 이름

### 의도를 분명히 밝혀라

이름을 지을 때 아래의 질문들을 고려해야 한다.

* 변수(혹은 함수나 클래스)의 존재 이유는?
* 수행 기능은?
* 사용 방법은?

**Bad**  

```java
public List<int[]> getThem() {
  List<int[]> list1 = new ArrayList<int[]>();
  for (int[] x : theList)
    if (x[0] == 4)
    	list1.add(x);
  return list1;
}
```

복잡한 코드는 아니지만  해당 메서드가 무엇을(them) 가져오는 것인지, List에 담기는 int[] 배열은 무슨 데이터인지, 4는 무슨 의미를 가지는지를 알 수 없다. 이 말은 곧 각 변수들의 정보를 모르는 경우 코드의 맥락을 완전히 이해 할 수 없다는 뜻이다.  
각 변수들의 정보를 모르더라도 이해할 수 있도록 아래와 같이 수정할 수 있다.

**Good**  

```java
public List<Cell> getFlaggedCells() {
  List<Cell> flaggedCells = new ArrayList<Cell>();
  for (Cell cell : gameBoard)
    if (cell.isFlagged())
      flaggedCells.add(cell);
  return flaggedCells;
}
```

<br>

### 그릇된 정보를 피하라

* 약어를 지양하자  
* 여러 계정을 그룹으로 묶을 때 List와 같은 특정 컨테이너의 사용을 지양하라 (e.g., **accountList -> Accounts**)  
* 네이밍은 서로 비슷한 이름을 사용하지 말자  
* 유사한 개념은 유사한 표기법을 사용하자, 일관성이 떨어지는 표기법은 그릇된 정보이다.  
* 다른 글자와 혼동되는 단일 알파벳을 피하자 (e.g., 소문자 L <-> 1, 대문자 I)

<br>

### 의미 있게 구분하라

한 scope에서 동일 이름을 사용할 수 없으니 컴파일러를 통과하기 위한 무의미한 철자 변경의 오류를 범하지 않도록 해야 한다. 무의미한 철자 변경의 대표적인 두가지 예시는 아래와 같다.    

* 연속된 숫자를 덧붙이기     
  **Bad :**

  ```java
  public static void copyChars(char a1[], char a2[])
  ```

  **Good :**  

  ```java
  public static void copyChars(char souce[], char destination[])
  ```


* 불용어(noise word) 추가    
  불용어란? 없어도 의미 전달에 영향이 없는 단어

  * 접두어 사용을 조심하자  
    a, an, the와 같은 접두어는 의미가 분명히 다를 때만 사용하도록 한다. (e.g., 모든 지역변수는 a 접두사 사용, 모든 함수 인수는 the 접두사 사용)  
  * 불용어를 사용하여 중복을 발생시키지 말자  
    product라는 클래스가 존재 할 때 ProductInfo, ProductData와 같은 개념이 구분되지 않는 클래스를 생성하여 중복을 발생시키지 않도록 한다. (e.g.,  Money & MoneyAccaount, CustomerInfo & Customer, AccountData & Account)


<br>

### 검색하기 쉬운 이름을 사용하라

* **상수**  
  상수값에 버그가 있을 경우 검색으로 찾아낼 수 없다. 그러나 상수값의 의미를 나타내는 변수로 정의하여 사용하면 검색에 용의하다.

* **변수**  
  알파벳 하나를 변수로 사용하면 검색이 어렵다. 

**Bad :**  

```java
int s = 0;
for (int i = 0; i < 30; i++) 
  s += i * 4;
```

**Good :**  

```java
int maxIndex = 30;
const int MULTIPLICATION_CONDITION = 4;
int sum = 0;
for (int i = 0; i < maxIndex; i++) // 하나의 메서드에서만 쓰이며, 다시 쓰이지 않는다면 한 문자 변수도 나쁘지 않다
  sum += i * MULTIPLICATION_CONDITION;
```

  <br>

### 인코딩을 피하라

* 헝가리식 표기법을 지양하라  
  과거 프로그래밍 언어는 변수 및 함수의 인자 이름 앞에 데이터 타입을 명시하는 헝가리식 표기법을 사용하였으나 현대의 프로그래밍 언어는 많은 컴파일러가 타입을 기억하고 강제하므로 네이밍 시 타입을 직접 명시하는 것을 피하는 것이 좋다. 오히려 아래와 같은 문제가 발생 할 수 있다.    

  ```java
  PhoneNumber phoneString; // 이러한 경우 타입이 바뀌게 되었을 때 변수명도 바꿔주어야 하는 문제가 생긴다.
  ```

* 멤버 변수 접두어  
  멤버 변수임을 명시하기 위해 "m_" 접두어를 붙이는 것을 지양하고 클래승와 함수는 접두어가 필요없을 정도로 작게 구현해야 한다.  

* 인코딩이 필요한 경우?  
  Abstract Factory를 구현하는 경우, 인터페이스 클래스 이름보다는 구현 클래스의 이름을 인코딩 하는 것이 좋다.  
  **Bad :**

  ```java
  public interface IShapeFactory;  // 인터페이스 클래스
  public class ShapeFactory;  // 구현 클래스
  ```

  **Good :**  

  ```java
  public interface ShapeFactory;  // 인터페이스 클래스
  public class ShapeFactoryImp;  // 구현 클래스
  public class CShapeFactory;  // 구현 클래스    
  ```

<br>

### 클래스 이름

* 동사가 들어가지 않는 명사/명사구가 적합하다.
* 불용어를 지양하자 (e.g., Manager, Processor, Data, Info)

**Good :**  

```java
public class Customer
public class WikiPage
public class AddressParser
```

<br>

### 메서드 이름

* 동사/동사구가 적합하다.

* 접근자(Accessor), 변경자(Mutator), 조건자(Predicate)는 [javabean 표준](https://www.oracle.com/technetwork/java/javase/documentation/spec-136004.html)에 따라 get, set, is를 붙인다.  
  e.g.,  

  ```java
  String name = employee.getName();
  customer.setName("mike");
  if (paycheck.isPosted());
  ```

  

* 생성자의 중복정의 시 정적 팩토리 메서드를 사용한다. (이때, 생성자 사용을 제한하려면 해당 생성자를 private으로 사용한다.)    

  - 해당 내용의 상세한 특징은 Effective Java 3/E 기준 Item1을 참고한다. 

  **Bad :**  

  ```java
  Complex fulcrumPoint = new Complex(23.0);
  ```

  **Good :**

  ```java
  Complex fulcrumPoint = Complex.FromRealNumber(23.0);
  ```

