# 자바 ORM 표준 JPA 프로그래밍

# 0. 강좌 소개

## JPA - Java Persistence API 

<br>

# 1. JPA 소개

## 1. SQL 중심적인 개발의 문제점

객체지향 언어 + 관계형 DB  
객체 CRUD (자바 객체 <-> SQL 의 무한반) - 필드 추가/변경 시에 코드에 문제가 생기는 일이 빈번  
**SQL에 의존적인 개발을 피하기 어려움!!!**   
속성과 기능을 묶어서 캡슐화 해서 쓰는게 목표인 객체 vs 데이터를 정규화해서 잘 보관하기 위한 기술인 관계형 DB - **패러다임의 불일치**  

### 객체 vs 관계형 데이터베이스의 차이

- 상속  
  ![JPA-1-inheritance](/Users/kyeoneee/Desktop/TIL/docs/images/JPA-1-1-inheritance.png)  
- 연관관계  
  ![JPA-1-object-table-relation](/Users/kyeoneee/Desktop/TIL/docs/images/JPA-1-1-object-table-relation.png)
  - 객체 : **참조** `member.getTeam()`, Member에서 Team 참조는 가능하지만 반대는 불가
  - 테이블 : **외래  키** `JOIN ON M.TEAM_ID = T.TEAM_ID`, Member와 Team 쌍방향으로 서로 호출 가능
- 데이터 타입
- 데이터 식별 방법

<br>

## 2. JPA 소개

### JPA?

- Java Persistence API
- 자바 진영의 ORM 기술 표준

### ORM?

- Object-relational mapping
- 객체는 객체대로 설계하고 RDB는 RDB 대로 설계
- ORM 프레임워크가 중간에서 매핑
- 대중적인 언어에는 대부분 ORM 기술이 존재

### JPA는 애플리케이션과 JDBC 사이에서 동작

![JPA-1-2-jpa-jdbc](/Users/kyeoneee/Desktop/TIL/docs/images/JPA-1-2-jpa-jdbc.png)

#### CRUD 과정에서 JPA의 역할

- Entity 분석하여 SQL 생성
- JDBC API 사용
- **패러다임 불일치 해결**
- 조회의 경우 - ResultSet 매핑

### JPA 는 표준 명세

- 인터페이스의 모음
- JPA 2.1 표준 명세를 구현한 3가지 구현체
  - Hibernate, EclipseLink, DataNucleus

### JPA를 왜 사용해야 하는가?

- SQL 중심적인 개발에서 객체 중심으로 개발

- 생산성

  - 저장 - `jpa.persist(member)`
  - 조회 - `Member member = jpa.find(memberId)`
  - 수정 - `member.setName("변경할 이름")`
  - 삭제 - `jpa.remove(member)`

- 유지보수

  - 기존 - 필드 변경시 모든 SQL 수정  
  - JPA - 필드만 추가, SQL은 JPA가 처리

- 패러다임의 불일치 해결

  - JPA와 상속

    - 상속관계에 있는 두 테이블의 객체 데이터를 업데이트 시 JPA가 알아서 각 테이블마다 SQL 생성해서 날림  

  - JPA와 연관관계  

    ```java
    // 연관관계 저장
    member.setTeam(team)];
    jpa.persist(member);
    ```

  - JPA와 객체 그래프 탐색  

    ```java
    // 객체 그래프 탐색
    Member member = jpa.find(Memberl.class, memberId);
    Team team = member.getTeam();
    ```

  - JPA와 비교하기   

    ```java
    String memberId = "100";
    Member member1 = jpa.find(Member.class, memberId);
    Member member2 = jpa.find(Member.class, memberId);
    
    member1 == member2; // 같다
    // 동일한 트랜잭션에서 같은 엔티티를 반환
    ```

- 성능

  - 1차 캐시와 동일성 보장
    - 동일한 트랜잭션에서 같은 엔티티를 반환
  - 트랜잭션을 지원하는 쓰기 지연
  - 지연 로딩과 즉시 로딩
    - 지연 로딩 - 객체가 실제 사용될 때 로딩
    - 즉시 로딩 - JOIN SQL로 한번에 연관된 객체까지 미리 조회, 두 객체를 같이 쓰는 경우가 더 많을 때 유리

- 데이터 접근 추상화와 벤더 독립성

- 표준

<br>

# 2. JPA 시작하기

## 1. Hello JPA - 프로젝트 생성

### 데이터베이스 방언

- JPA는 특정 데이터베이스에 종속 X
- 각각의 데이터베이스가 제공하는 SQL 문법과 함수가 조금씩 다름
  - 가변 문자 : MySQL은 VARCHAR, Oracle은 VARCHAR2
  - 문자열을 자르는 함수 : SQL 표준은 SUBSTRING(), Oracle은 SUBSTR()
  - 페이징 : MySQL은 LIMIT, Oracle은 ROWNUM
- 방언 : SQL  표준을 지키지 않는 특정 데이터베이스만의 고유한 기능
- `hibernate.dialect` 속성에 지정하여 JPA가 방언을 해석할 수 있도록 해야 함
  - H2 : org.hibernate.dialect.H2Dialect
  - Oracle 10g : org.hibernate.dialect.Oracle10gDialect 
  - MySQL : org.hibernate.dialect.MySQL5InnoDBDialect

## 2. Hello JPA -  애플리케이션 개발

![JPA-2-2-jpa-inner](/Users/kyeoneee/Desktop/TIL/docs/images/JPA-2-2-jpa-inner.png)

