# 실전! 스프링 데이터 JPA

> **url** : https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%EB%8D%B0%EC%9D%B4%ED%84%B0-JPA-%EC%8B%A4%EC%A0%84/dashboard/
> **강사** : 김영한

  

# 0. 스프링 데이터 JPA 소개

<br>

# 1. 프로젝트 환경설정

## 2. 라이브러리 살펴보기

- spring-boot-starter-data-jpa
  - hibernate-core : 객체 관계 매핑 프레임워크
  - spring-boot-starter-aop : spring core, hibernate 등의 의존성 포함
  - spring-boot-starter-jdbc : db connection pool 등

<br>

# 4. 쿼리 메소드 기능

## 1. 메소드 이름으로 쿼리 생성

### 순수 JPA Repository

```java
public List<Chap4Member> findByUsernameAndAgeGreaterThan(String username, int age) {  
    return em.createQuery("select m from Chap4Member m where m.username = :username and m.age > :age")  
            .setParameter("username", username)  
            .setParameter("age", age)  
            .getResultList();  
}
```

   

### Spring Data JPA Repository

```java
public interface Chap4MemberRepository extends JpaRepository<Member, Long> {  
    List<Member> findByUsernameAndAgeGreaterThan(String username, int age);  
}
```

- 메서드 이름으로 쿼리를 생성

- 위의 메서드는 `select m from Chap4Member m where m.username = :username and m.age > :age` 와 동일하며, 메서드의 매개변수로 넘어온 것으로 파라미터를 대신할 수 있음

- 메서드 이름 중 Entity의 필드명을 기반으로 쿼리를 생성하기 때문에 필드명을 주의해야 함
  필드명을 잘못 입력 혹은 변경시 컴파일 시점에`org.springframework.data.mapping.PropertyReferenceException: No property username2 found for type Member! Did you mean 'username'?` 이러한 에러와 함께 에러 확인이 가능함

  

### Spring Data JPA가 제공하는 쿼리 메소드 기능

[쿼리 생성 규칙 공식 문서](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.query-creation)를 참고

- 조회
  - find...By ,read...By ,query...By get...By,
  - ... 자리에는 식별하기 위한 내용이 들어가도 됨(아무거나 들어가도 됩니다.)
- COUNT
     - count...By 반환타입 long
- EXISTS
     - exists...By 반환타입 boolean
- 삭제
     - delete...By, remove...By 반환타입 long 
- DISTINCT
     - findDistinct, findMemberDistinctBy 
- LIMIT
     - findFirst3, findFirst, findTop, findTop3

쿼리 메소드는 편하긴 하지만, 조건이 많아지면 메서드 명이 길어지는 상황이 발생함. 이를 다양하게 해결하는 방법들 : NamedQuery, QueryDSL 등


<br>

## 2. JPA NamedQuery

### `@NamedQuery` 어노테이션으로 쿼리 정의

```java
@Entity  
@NamedQuery(  
        name="Member.findByUsername",  
        query="select m from Member m where m.username = :username"  
)  
public class Chap4Member {
  ...  
}
```

### 쿼리 사용

```java
public class MemberRepository {  
	public List<Member> findByUsername(String username) {   
	List<Member> resultList = em.createNamedQuery("Member.findByUsername", Member.class)  
    .setParameter("username", username)   
    .getResultList();  
  }   
}
```

### SpringData JPA로 NamedQuery 사용

```java
public interface MemberRepository extends JpaRepository<Member, Long> {  
	@Query(name = "Member.findByUsername")  // 주석처리해도 동작 가능  
	List<Member> findByUsername(@Param("username") String username);  // query에 parameter가 존재할 때 @Param 어노테이션으로 명확하게 명시 필요  
}
```

- `@Query`어노에티션을 작성하지 않더라도 spring data Jpa가 `도메인 클래스 + .(점) + 메서드 이름"`으로 Named 쿼리를 찾아서 실행하므로 생략 가능  
- 실행할 NamedQuery가 없는 경우(매칭되는 쿼리가 없는 경우) 메서드 이름으로 쿼리 생성 전략을 사용

#### NamedQuery의 장점?

- 정적 쿼리이므로 어플리케이션 로딩 시점에 파싱을 진행해 버그 발견 가능

<br>

## 3. @Query, 리포지토리 메소드에 쿼리 정의하기

NamedQuery의 장점을 가지면서 Repository 클래스 내에 쿼리를 정의

```java
public interface MemberRepository extends JpaRepository<Member, Long> {  
  @Query("select m from Member m where m.username= :username and m.age = :age")   
  List<Member> findUser(@Param("username") String username, @Param("age") int age);  
}
```

- NamedQuery의 장점과 마찬가지로 **애플리케이션 실행 시점에 오타 등의 오류 발견 가능**

<br>

## 4. @Query, 값, DTO 조회하기

 ```java
public interface MemberRepository extends JpaRepository<Member, Long> {  
	@Query("select m.username from Member m")  
  List<String> findUsernameList();  
}
 ```

### DTO로 직접 조회

```java
@Data  // 실제 서비스에서는 Data는 꼭 필요할 때만 쓰도록  
public class MemberDto {  
  private Long id;  
  private String username;  
  private String teamName;  
    
  public MemberDto(Long id, String username, String teamName) {   
    this.id = id;  
    this.username = username;  
    this.teamName = teamName;   
  }  
}  
  
public interface MemberRepository extends JpaRepository<Member, Long> {  
	@Query("select new study.datajpa.repository.MemberDto(m.id, m.username,  t.name) from Member m join m.team t")  
  List<MemberDto> findMemberDto();  
}
```

- DTO로 직접 조회하기 위해서는 new 명령어를 꼭 사용
- DTO에 쿼리에 맞는 생성자가 존재해야 함

<br>

## 4. 파라미터 바인딩

- 위치 기반 - 위치 변경시 버그 발생 가능성이 높으므로 이름 기반 사용이 더욱 용이
- 이름 기반

```sql
select m from Member m where m.username = ?0 //위치 기반   
select m from Member m where m.username = :name //이름 기반
```

#### 파라미터 바인딩

```java
public interface MemberRepository extends JpaRepository<Member, Long> {   
  @Query("select m from Member m where m.username = :name")  
  Member findMembers(@Param("name") String username);  
}
```

#### 컬렉션 파라미터 바인딩

Collection 타입으로 in 절에 여러 값 바인딩 가능

```java
@Query("select m from Member m where m.username in :names")  
List<Member> findByNames(@Param("names") Collection<String> names);
```

<br>

## 5. 반환 타입

```java
List<Member> findByUsername(String name); //컬렉션  
Member findByUsername(String name); //단건  
Optional<Member> findByUsername(String name); //단건 Optional
```

#### 조회 결과가 많거나 없는 경우?

```java
    @Test  
    public void returnType() {  
      Member m1 = new Member("AAA", 10);  
      Member m2 = new Member("AAA", 20);  
      memberRepository.save(m1);  
      memberRepository.save(m2);  
  
      // 데이터가 없는 경우 empty collection 반환  
      List<Member> lisetResult = memberRepository.findListByUsername("aebesd");  
      assertThat(lisetResult).isNotNull();  
      assertThat(lisetResult).hasSize(0);  
  
      // 데이터가 없는 경우 null 반환  
      Member singleResult = memberRepository.findMemberByUsername("aebesd");  
      assertThat(singleResult).isNull();  
  
      // Optional이 실무 개발시 null 체크 등 불필요한 코드를 줄이기 용이함  
      Optional<Member> optionalResult = memberRepository.findOptionalByUsername("aebesd");  
      assertThat(optionalResult).isNotPresent();  
        
      // 단건 조회를 의도하였으나 DB에는 데이터가 2건이 있으므로  
      // javax.persistence.NonUniqueResultException 예외 발생  
			memberRepository.findMemberByUsername("AAA");  
    }
```

-  컬렉션
  - 결과 없음: 빈 컬렉션 반환 
- 단건 조회
  - 결과 없음: null 반환  
    SpringData JPA 내부에서 호출하는 JPQL의 `Query.getSingleResult()`메서드를 호출하여 결과가 없는 경우 `javax.persistence.NoResultException`을 발생시키는데, JPA가 이를 래핑하여 null을 반환
  - 결과가 2건 이상: `javax.persistence.NonUniqueResultException` 예외 발생

<br>

## 6. 순수 JPA 페이징과 정렬

### JPA 페이징 레파지토리 코드

```java
public List<Member> findByPage(int age, int offset, int limit) {  
	return em.createQuery("select m from Member m where m.age = :age order by m.username desc")  
    .setParameter("age", age)  
    .setFirstResult(offset)  
    .setMaxResults(limit)  
    .getResultList();  
}  
  
public long totalCount(int age) {  
	return em.createQuery("select count(m) from Member m where m.age = :age", Long.class)  
    .setParameter("age", age)  
    .getSingleResult();  
}
```

#### JPA 페이징 테스트 코드

```java
    @Test
    public void paging() {  
        // given  
        memberJpaRepository.save(new Member("member1", 10));  
        memberJpaRepository.save(new Member("member2", 10));  
        memberJpaRepository.save(new Member("member3", 10));  
        memberJpaRepository.save(new Member("member4", 10));  
        memberJpaRepository.save(new Member("member5", 10));  
  
        int age = 10, offset = 0, limit = 3;  
  
        // when  
        List<Member> members = memberJpaRepository.findByPage(age, offset, limit);  
        long totalCount = memberJpaRepository.totalCount(age);  
  
        // then  
        assertThat(members.size()).isEqualTo(3);  
        assertThat(totalCount).isEqualTo(5);  
    }
```

- 해당 코드에서는 없지만 실무에서 사용하기 위해서는 total page, 마지막 페이지 여부, 최초 페이지 여부 등이 함께 추가되면 좋음

<br>

## 7. 스프링 데이터 JPA 페이징과 정렬

### 페이징과 정렬 파라미터

디비의 종류에 상관없이 두가지 인터페이스로 페이징을 공통화 시킴

- `org.springframework.data.domain.Sort` : 정렬 기능 
- `org.springframework.data.domain.Pageable` : 페이징 기능 (내부에 Sort 포함)

### 특별한 반환 타입

totalCount가 없는 타입 (eg. 인스타그램과 같은 동적 페이징 서비스의 경우 사용)

- `org.springframework.data.domain.Page` : totalCount 포함 (0부터 시작)
- `org.springframework.data.domain.Slice` : totalCount 불포함 다음 페이지만 확인 가능(내부적 으로 limit + 1조회)
- `List` (자바 컬렉션): totalCount 없이 결과만 반환

### 페이징과 정렬 사1용 예제

##### Page 사용 예제 정의 코드

```java
public interface MemberRepository extends Repository<Member, Long> {  
  Page<Member> findByAge(int age, Pageable pageable);  
}  
  
//페이징 조건과 정렬 조건 설정  
@Test
public void page() throws Exception {
  //given
  memberRepository.save(new Member("member1", 10));
  memberRepository.save(new Member("member2", 10));
  memberRepository.save(new Member("member3", 10));  
  memberRepository.save(new Member("member4", 10));  
  memberRepository.save(new Member("member5", 10));  
    
	//when  
	PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "username"));  
  Page<Member> page = memberRepository.findByAge(10, pageRequest);  
    
	//then  
  List<Member> content = page.getContent(); //조회된 데이터  
  assertThat(content.size()).isEqualTo(3); //조회된 데이터 수  
  assertThat(page.getTotalElements()).isEqualTo(5); //전체 데이터   
  assertThat(page.getNumber()).isEqualTo(0); //페이지 번호  
  assertThat(page.getTotalPages()).isEqualTo(2); //전체 페이지 번호  
  assertThat(page.isFirst()).isTrue(); //첫번째 항목인가?  
  assertThat(page.hasNext()).isTrue(); //다음 페이지가 있는가?  
}
```

- `Pagable` 인터페이스를 사용할 때는 구현체인 `org.springframework.data.domain.PageRequest` 객체 사용
- PageRequest.of(현재 페이지, 조회할 데이터 수, option - 정렬 정보)
- Page는 0부터 시작

### Count 쿼리 분리

join과 같이 복잡한 쿼리의 경우 totalCount 결과 값은 동일하지만 성능에 영향이 있을 수 있음  
이러한 경우 데이터 추출 쿼리와 countQuery를 분리해주는게 좋음

```java
@Query(value = “select m from Member m”, 
       countQuery = “select count(m.username) from Member m”)  Page<Member> findMemberAllCountBy(Pageable pageable);
```

### 페이지를 유지하면서 엔티티를 DTO로 변환하기

Entity를 외부에 노출시키면 수정 발생 시 API Client들에게 장애를 일으킬 수 있으므로 꼭 DTO를 노출시켜야 함  

```java
Page<Member> page = memberRepository.findByAge(10, pageRequest);  
Page<MemberDto> dtoPage = page.map(m -> new MemberDto());  
```

<br>

## 8. 벌크성 수정 쿼리

다량의 데이터를 동일한 값으로 수정하는 등의 작업을 수행하는 쿼리

### JPA를 사용한 벌크성 수정 쿼리

```java
public int bulkAgePlus(int age) { 
  int resultCount = em.createQuery(
"update Member m set m.age = m.age + 1 where m.age >= :age")  
    .setParameter("age", age)  
    .executeUpdate();   
  return resultCount;  
}  

@Test   
public void bulkUpdate() throws Exception {  
  //given  
  memberJpaRepository.save(new Member("member1", 10));  
  memberJpaRepository.save(new Member("member2", 19));  
  memberJpaRepository.save(new Member("member3", 20));  
  memberJpaRepository.save(new Member("member4", 21));  
  memberJpaRepository.save(new Member("member5", 40));  
    
  //when  
  int resultCount = memberJpaRepository.bulkAgePlus(20);  
  
  //then  
  assertThat(resultCount).isEqualTo(3);   
}
```

### SpringData JPA를 사용한 벌크성 수정 쿼리

```java
@Modifying // executeUpdate 설정 역할의 어노테이션  
@Query("update Member m set m.age = m.age + 1 where m.age >= :age")  
int bulkAgePlus(@Param("age") int age);  
  
@Test  
public void bulkUpdate() throws Exception {  
  //given  
  memberRepository.save(new Member("member1", 10));  
  memberRepository.save(new Member("member2", 19));  
  memberRepository.save(new Member("member3", 20));  
  memberRepository.save(new Member("member4", 21));  
  memberRepository.save(new Member("member5", 40));  
    
	//when  
	int resultCount = memberRepository.bulkAgePlus(20);  
    
	//then  
  assertThat(resultCount).isEqualTo(3);   
}
```

- `@Modifying` 어노테이션 - 벌크성 수정, 삭제 쿼리에 꼭 사용
  - 누락시 exception 발생 -  ` org.hibernate.hql.internal.QueryExecutionRequestException: Not supported for DML operations`
- 벌크성 쿼리를 실행하고 나서 영속성 컨텍스트 초기화
  -  `@Modifying(clearAutomatically = true)` - default : false
  - 옵션이 없는 경우 쿼리 실행 후 `findById`로 조회 시 영속성 컨텍스트에 있는 엔티티의 상태와 DB의 상태가 다를 수 있 -> **쿼리 실행 후 바로 조회해야 할 땐 영속성 컨텍스트 초기화**

<br>

## 9. @EntityGraph

- @ManyToOne(fetch = FetchType.LAZY)
  - 연관관계가 있는 데이터를 무조건 가져오는 것이 아니라, 처음에는 가짜 객체로 세팅하고 이후에 실제 사용될 때 쿼리를 날려 데이터를 가져오는 것
  - n + 1 문제  
    하나의 쿼리에 n번의 추가 쿼리가 발생하게 됨
  - 이를 해결하기 위한 개념이 EntityGraph

연관된 엔티티들을 SQL 한번에 조회하는 방법

### JPQL fetch join

```java
@Query("select m from Member m left join fetch m.team")  
List<Member> findMemberFetchJoin();
```

- 단점 : 쿼리를 문자열로 적어줘야 하므로 스킴 변경등의 상황이 발생했을 때 수정해야 하는 부분이 많음

### EntityGraph

```java
@Override  
@EntityGraph(attributePaths = {"team"}) List<Member> findAll();  
  
//JPQL + 엔티티 그래프   
@EntityGraph(attributePaths = {"team"})  
@Query("select m from Member m")   
List<Member> findMemberEntityGraph();  
  
// 전체조회가 아닌 경우에도 사용 가능  
@EntityGraph(attributePaths = {"team"})  
List<Member> findByUsername(@Param("username") String username)
```

- LEFT OUTER JOIN 사용   
  쿼리의 로그를 보면 아래와 같음

  ```sql
  select  
  		membe0_.member_id as member_i1_2_0_,  
  		team1_.team_id as team_id1_3_1_,  
  		membe0_.age as age2_2_0_,  
  		membe0_.team_id as team_id4_2_0_,  
  		membe0_.username as username3_2_0_,
  		team1_.name as name2_3_1_ 
  from
  	  member membe0_ 
  	left outer join
  		team team1_ 
  			on membe0_.team_id=team1_.team_id
  ```

### NamedEntityGraph 사용 방법

  ```java
  @NamedEntityGraph(name = "Member.all", attributeNodes = @NamedAttributeNode("team"))  
  @Entity  
  public class Member {}  
    
  @EntityGraph("Member.all")   
  @Query("select m from Member m")  
  List<Member> findMemberEntityGraph();
  ```

  <br>

## JPA Hint & Lock

SQL Hint 와 동일하지 X, JPA 구현체에게 제공하는 힌트

###   쿼리 힌트 사용

```java
@QueryHints(value = @QueryHint(name = "org.hibernate.readOnly", value = "true"))  
Member findReadOnlyByUsername(String username);
```

- 실무에서는 대용량의 조회에 이슈가 생기는 경우는 앞단에 캐시를 두는게 훨씬 효율적일 수 있음

### Lock

DB의 Lock 기능을 JPA가 지원

```java
@Lock(LockModeType.PESSIMISTIC_WRITE) List<Member> findByUsername(String name);
```

- `org.springframework.data.jpa.repository.Lock` JPA가 사용하는 기능임
- 실시간 트래픽이 많은 경우 성능저하를 일으킬 수 있으므로 조심히 사용

<br>

# 5. 확장 기능

## 1. 사용자 정의 리포지토리 구현

- 스프링 데이터 JPA 리포지토리는 인터페이스만 정의하고 구현체는 스프링이 자동 생성
- 다양한 이유로 인터페이스의 메서드를 직접 구현하고 싶다면?
  - JPA 직접 사용( EntityManager ) 
  - 스프링 JDBC Template 사용 
  - MyBatis 사용
  - 데이터베이스 커넥션 직접 사용
  - **Querydsl 사용** : 가장 높은 비율

### 사용자 정의 인터페이스와 구현 클래스

```java
public interface MemberRepositoryCustom {  
  List<Member> findMemberCustom();  
}  

// 네이밍 규칙을 꼭 맞춰줘야 함 (인터페이스+Impl)  
// 그래야 스프링이 실제 구현체를 찾을 수 있음  
@RequiredArgsConstructor  
public class MemberRepositoryImpl implements MemberRepositoryCustom {  
  private final EntityManager em;  
  @Override  
  public List<Member> findMemberCustom() {  
    return em.createQuery("select m from Member m")   
      .getResultList();  
  }   
}  
  
// 사용자 정의 인터페이스를 상속받도록 하여 기존 레파지토리와 함께 사용
public interface MemberRepository  
  		extends JpaRepository<Member, Long>, MemberRepositoryCustom {  
}  
```

**사용자 정의 구현 클래스**

- 규칙: **레파지토리 인터페이스 이름 + Impl**
- 스프링 데이터 JPA가 인식해서 스프링 빈으로 등록

### Impl 대신 다른 이름으로 변경하고 싶으면?

- XML 설정  

  ```java
  <repositories base-package="study.datajpa.repository" repository-impl-postfix="Impl" />  
  ```

- JavaConfig 설정  

  ```java
  @EnableJpaRepositories(basePackages = "study.datajpa.repository",  
                             repositoryImplementationPostfix = "Impl")
  ```

> Custom에 단순히 화면에 보여지는 repository와 비즈니스 로직을 가지는 repository을 모두 custom에 때려넣다 보면 클래스가 너무 비대해질 수 있음  
> 이러한 경우 추후 유지보수 비용이 늘어날 수도 있으므로 실무에서는 이러한 요소들을 고려하여 클래스를 잘 분리해야 함

<br>

## 2. Auditing

### 엔티티를 생성, 변경할 때 변경한 사람과 시간을 추적하기 위한 데이터  

데이터의 정합성이 깨지거나 하는 등의 경우 추적을 용이하게 해주는 데이터

- 등록일
- 수정일
- 등록자
- 수정자

### 순수 JPA 사용

```java
@MappedSuperclass  
@Getter  
public class JpaBaseEntity {  
  @Column(updatable = false)  
  private LocalDateTime createdDate;  
  private LocalDateTime updatedDate;  
    
  @PrePersist  
  public void prePersist() {  
    LocalDateTime now = LocalDateTime.now();   
    createdDate = now;  
    updatedDate = now;  
	}  
    
	@PreUpdate  
	public void preUpdate() {  
  	updatedDate = LocalDateTime.now();   
  }  
}  
  
public class Member extends JpaBaseEntity {}  
```

### JPA 주요 이벤트 어노테이션

- @PostLoad: 해당 엔티티를 새로 불러오거나 refresh 한 이후
- @PrePersist: 해당 엔티티를 저장하기 이전
- @PostPersist: 해당 엔티티를 저장한 이후
- @PreUpdate: 해당 엔티티를 업데이트 하기 이전
- @PostUpdate: 해당 엔티티를 업데이트 한 이후
- @PreRemove: 해당 엔티티를 삭제하기 이전
- @PostRemove: 해당 엔티티를 삭제한 이후

### SpringData JPA 사용

#### 설정

- `@EnableJpaAuditing` -> SpringBoot 설정 클래스에 적용
- `@EntityListeners(AuditingEntityListener.class)` -> Auditing 엔티티 클래스에 적용

```java
@EnableJpaAuditing  
@SpringBootApplication  
public class PracticeSpringJpaApplication {  
  ...  
}  
  
@EntityListeners(AuditingEntityListener.class)  
@MappedSuperclass  
@Getter  
public class Chap5BaseEntity {  
  ...  
}
```

### Spring Data Auditing 적용

하나의 클래스에서 등록시간, 수정시간, 등록자, 수정자를 다 구현할 수 있지만  
실무에서는 등록자, 수정자가 불필요한 클래스가 존재할 수 있으므로 나누어서 구현해주는 방법이 더 유용

```java
@EntityListeners(AuditingEntityListener.class)   
@MappedSuperclass  
@Getter  
public class BaseTimeEntity {  
  @CreatedDate  
  @Column(updatable = false)  
  private LocalDateTime createdDate;  
    
  @LastModifiedDate  
  private LocalDateTime lastModifiedDate;  
}  
  
public class BaseEntity extends BaseTimeEntity {  
  @CreatedBy  
  @Column(updatable = false)  
  private String createdBy;  
    
  @LastModifiedBy  
  private String lastModifiedBy;  
}
```

- 모든 엔티티에 설정해주기 귀찮은 경우 JPA spec에 있는 기능을 이용하여 전체 적용도 가능  
  아래와 같은 `META-INF/orm.xml` 파일 생성  

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <entity-mappings xmlns="http://xmlns.jcp.org/xml/ns/persistence/orm"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence/ orm http://xmlns.jcp.org/xml/ns/persistence/orm_2_2.xsd"  
                   version="2.2">  
    
      <persistence-unit-metadata>  
          <persistence-unit-defaults>  
              <entity-listeners>  
                  <entity-listener                      class="org.springframework.data.jpa.domain.support.AuditingEntityListener"/>  
              </entity-listeners>  
          </persistence-unit-defaults>  
      </persistence-unit-metadata>  
  </entity-mappings>
  ```
  


### 등록자, 수정자를 처리해주는 AuditorAware 스피링 빈 등록

```java
@EnableJpaAuditing
@SpringBootApplication
public class PracticeSpringJpaApplication {
  ...    

  @Bean
  public AuditorAware<String> auditorProvider() {
    return () -> Optional.of(UUID.randomUUID().toString()); 
  }
}
```

- 실무에서는 세션 정보 또는 스프링 시큐리티 로그인 정보에서 ID를 받음
- 저장시점에 저장데이터만 입력하고 싶으면 `@EnableJpaAuditing(modifyOnCreate = false)` 옵션을 사용

<br>

## 3. Web 확장 - 도메인 클래스 컨버터

HTTP 파라미터로 넘어온 엔티티의 아이디(PK)로 객체를 찾아서 바인딩  
PK가 외부에 노출되기 때문에 권장하지는 않음

#### 도메인 클래스 컨버터 사용 전

``` java
@RestController
@RequiredArgsConstructor
public class MemberController {  
  private final MemberRepository memberRepository;  
     
  @GetMapping("/members/{id}")  
  public String findMember(@PathVariable("id") Long id) {  
    Member member = memberRepository.findById(id).get();  
    return member.getUsername();   
  }  
}
```

#### 도메인 클래스 컨버터 사용 후

```java
@RestController  
@RequiredArgsConstructor  
public class MemberController {  
  private final MemberRepository memberRepository;  
  
  @GetMapping("/members/{id}")  
  public String findMember(@PathVariable("id") Member member) {  
    return member.getUsername();   
  }  
}
```

- `http://localhost:10080/members/1` 이렇게 사용자에게는 `id` 값을 넘겨 받지만 도메인 클래스 컨버터가 repository를 이용해 회원 엔티티를 찾아서 객체 반환
- 트랜젝션이 없는 범위에서 엔티티를 조회했으므로, 엔티티를 변경해도 DB에 반영되지 않으므로 **조회용으로만 사용해야 함**

<br>

## 4. Web 확장 - 페이징과 정렬

###  페이징과 정렬 예제

```java
@GetMapping("/members")   
public Page<Member> list(Pageable pageable) {  
  Page<Member> page = memberRepository.findAll(pageable);  
  return page;  
}
```

- 파라미터로 `Pageable`을 받아서 페이지 SpringMVC paging 사용이 가능
- 실제로는 `org.springframework.data.domain.PageRequest ` 객체를 생성하여 사용

### 요청 파라미터

- eg. `/members?page=0&size=3&sort=id,desc&sort=username,desc`
- page: 현재 페이지, 0부터 시작
- size: 한 페이지에 노출할 데이터 건수
- sort: 정렬 조건을 정의

### 기본값

#### 글로벌 설정 - 스프링 부트 환경 설정값

```yaml
spring:  
  data:  
    web:  
      pageable:  
        default-page-size: 10  
        max-page-size: 200 
```

#### 개별 설정 - `@PageableDefault`

```java
@GetMapping("/members")  
public Page<Chap5Member> List(@PageableDefault(size = 5, sort = "username") Pageable pageable) {  
  Page<Chap5Member> page = memberRepository.findAll(pageable);  
  return page;  
}
```

### 접두사

- 페이징 정보가 둘 이상이면 접두사로 구분
- `@Qualifier`에 접두사명 추가 "{접두사명}_xxx"
- eg. `/members?member_page=0&order_page=1`

```java
public String list(  
	@Qualifier("member") Pageable memberPageable,   
  @Qualifier("order") Pageable orderPageable, ...)
```

### Page 내용을 DTO로 변환

- 외부에 노출되는 API의 경우 API 스펙이 변경되면 안됨  
  엔티티를 DTO로 변환해서 반환해야 함

-  Page가 지원하는 `map()`을 사용해 다른 객체로 매핑 가능  

  ```java
  @GetMapping("/members")  
  public Page<MemberDto> list(Pageable pageable) {  
    return memberRepository.findAll(pageable).map(MemberDto::new);
  }
  ```

### Page를 1부터 시작하기

- SpringData는 Page를 0부터 시작
- 1부터 시작하려면?
  - Pageable, Page를 사용하는게 아닌 Custom Class 생성
  - `spring.data.web.pageable.one-indexed-parameters` 를 true 로 설정  
    그런데 이 방법은 web에서 page 파라미터를 -1 처리 할 뿐이므로 응답값인 Page 에 모두 0 페이지 인덱스를 기준으로 값을 반환하는 한계가 있음

 <br>

# 6. 스프링 데이터 JPA 구현체 분석

## 1. 스프링 데이터 JPA 구현체 분석

`org.springframework.data.jpa.repository.support.SimpleJpaRepository`

- `@Repository` 적용
  - Spring Bean의 Componant scan 대상이 됨
  - JDBC, JPA의 예외를 스프링이 추상화한 예외로 변환  
    -> 하부 구현 기술이 바뀌어도 기존 비즈니스 로직에 영향을 주지 않음
- `@Transactional(readOnly = true)` 클래스 레벨의 설정
     - 데이터를 단순히 조회만 하고 변경하지 않는 트랜잭션에서 readOnly = true 옵션을 사용하면 플러시를 생략해서 약간의 성능 향상을 얻을 수 있음
     - 자세한 내용은 JPA 책 15.4.2 읽기 전용 쿼리의 성능 최적화 참고
- `@Transactional` 트랜잭션 적용
     - JPA의 모든 변경은 트랜잭션 안에서 동작
     - 스프링 데이터 JPA는 변경(등록, 수정, 삭제) 메서드를 트랜잭션 처리
     - 서비스 계층에서 트랜잭션을 시작하지 않으면 리파지토리 계층에서 트랜잭션 시작
     - 서비스 계층에서 트랜잭션을 시작하면 리파지토리는 해당 트랜잭션을 전파 받아서 사용  
       -> 스프링 데이터 JPA를 사용할 때 트랜잭션이 없어도 데이터 등록, 변경이 가능
- **매우 중요!!!**  `save() 메서드`
     - 새로운 엔티티면 저장 ( persist ) 
     - 새로운 엔티티가 아니면 병합 ( merge )   
          DB에서 데이터를 가져와서 현재 값으로 바꿔치기 : DB select 쿼리가 무조건 1회는 필요하기 때문에 성능에 영향이 있을 수 있어서 **가급적 사용하지 않는게 좋음**

<br>

## 2. 새로운 엔티티를 구별하는 방법

```java
@Transactional
@Override
public <S extends T> S save(S entity) {
		Assert.notNull(entity, "Entity must not be null.");

		if (entityInformation.isNew(entity)) {  // isNew 판단로직은 아래의 예시 참고
			em.persist(entity);  // id가 GeneratedValue 인 경우 아직 생성되지 않음
			return entity;  // persist 메서드가 실행된 이후에 id가 생성됨
		} else {
			return em.merge(entity);
		}
}

// 새로운 엔티티를 판단 전략 예시
// org.springframework.data.repository.core.support.AbstractEntityInformation
public boolean isNew(T entity) {

		ID id = getId(entity);
		Class<ID> idType = getIdType();

		if (!idType.isPrimitive()) {
			return id == null;
		}

		if (id instanceof Number) {
			return ((Number) id).longValue() == 0L;
		}

		throw new IllegalArgumentException(String.format("Unsupported primitive id type %s!", idType));
}
```

- 새로운 엔티티를 판단(`isNew()`)하는 기본 전략

  - 식별자가 객체일 때 `null`로 판단

  - 식별자가 자바 기본 타입일 때 `0`으로 판단

  - `Persistable` 인터페이스를 구현해서 판단 로직 변경 가능  

    ```java
    package org.springframework.data.domain;
    
    public interface Persistable<ID> {
      	ID getId();
      	boolean isNew();
    }
    ```


> 참고
>
> - JPA 식별자 생성 전략이 `@GenerateValue` 면 save() 호출 시점에 식별자가 없으므로 새로운 엔티 티로 인식해서 정상 동작한다.  
>   그런데 JPA 식별자 생성 전략이 `@Id` 만 사용해서 직접 할당이면 이미 식별자 값이 있는 상태로 save() 를 호출한다. 따라서 이 경우 merge() 가 호출된다. merge() 는 우선 DB를 호출해서 값을 확인하고, DB에 값이 없으면 새로운 엔티티로 인지하므로 매우 비효율 적이다.  
> 따라서 Persistable 를 사용해서 새로운 엔티티 확인 여부를 직접 구현하게는 효과적이다.  
>   
> - 참고로 등록시간( @CreatedDate )을 조합해서 사용하면 이 필드로 새로운 엔티티 여부를 편리하게 확인할 수 있다. (@CreatedDate에 값이 없으면 새로운 엔티티로 판단)  
>
>   ```java
>   @Entity
>   @EntityListeners(AuditingEntityListener.class)
>   @NoArgsConstructor(access = AccessLevel.PROTECTED)
>   public class Item implements Persistable<String> {
>   
>       @Id
>       private String id;
>   
>       @CreatedDate  // JPA event
>       private LocalDateTime createdDate;
>   
>       public Item(String id) {
>           this.id = id;
>       }
>   
>       @Override
>       public String getId() {
>           return id;
>       }
>   
>       @Override
>       public boolean isNew() {
>           return createdDate == null;
>       }
>   }
>   ```

<br>

# 7. 나머지 기능들

## 1. Specification (명세)

> DB 쿼리에서 사용하는 Where 문 내의 and, or와 같은 조건을 넣어주는걸 언어와 상관없이 조립해서 repository에 던지면 쿼리로 넘어가게 사용할 수 있도록 추상화한 개념  
> SpringData JPA는 Criteria를 활용해서 이 개념을 사용할 수 있도록 지원  
> 가독성이 안좋으므로 실무에서 사용은 **비추**

### 술어 (predicate)

- 참 또는 거짓으로 평가
- AND OR 같은 연산자로 조합, 다양한 검색 조건을 쉽게 생성
- 스프링 데이터 JPA는 `org.springframework.data.jpa.domain.Specification` 클래스로 정의

### 명세 기능 사용 방법



<br>

## 2. Query By Example

```java
@SpringBootTest  
@Transactional  
public class QueryByExampleTest {  
  @Autowired  
  MemberRepository memberRepository;  
  @Autowired  
  EntityManager em;  

  @Test  
  public void basic() throws Exception {  
    Team teamA = new Team("teamA");  
    em.persist(teamA);  
    
    em.persist(new Member("m1", 0, teamA));  
    em.persist(new Member("m2", 0, teamA));  
    em.flush();

    //Probe 생성  
    Member member = new Member("m1");  
    Team team = new Team("teamA"); //내부조인으로 teamA 가능      
    member.setTeam(team);  
    
    //ExampleMatcher 생성, age 프로퍼티는 무시  
    ExampleMatcher matcher = ExampleMatcher.matching().withIgnorePaths("age");  
    Example<Member> example = Example.of(member, matcher);  
    List<Member> result = memberRepository.findAll(example);  
    
    assertThat(result.size()).isEqualTo(1);  
  }  
}  
```

- Probe : 필드에 데이터가 있는 실제 도메인 객체
- ExampleMatcher: 특정 필드를 일치시키는 상세한 정보 제공, 재사용 가능
- Example: Probe와 ExampleMatcher로 구성, 쿼리를 생성하는데 사용  

### 장점

- 동적 쿼리를 편하게 처리  
- 도메인 객체를 그대로 사용  
- 데이터 저장소 RDB에서 NOSQL로 변경해도 코드 변경이 없게 추상화 되어 있음  
- `JpaRepository` 인터페이스에 이미 포함 (`JpaRepository`가 상속하는 `QueryByExampleExecutor<T>` 에서 구현)

### 단점  

- join에서 완벽한 해결이 어려움 (INNER JOIN만 가능, LEFT JOIN 불가)
- 중첩 제약조건 불가
  - `firstname = ?0 or (firstname = ?1 and lastname = ?2)`
- 매칭 조건이 단순
  - 문자는 starts/contains/ends/regex 
  - 다른속성은정확한매칭( = )만지원

<br>

## 3. Projection

Entity 대신 DTO를 편리하게 조회할 때 사용  
전체 엔티티가 아니라 특정 필드를 조회하고 싶은 경우에 사용 가능 

```java
public interface UsernameOnly {
      String getUsername();
}
```

- 조회할 엔티티의 필드를 getter 형식으로 지정하면 해당 필드만 선택해서 조회  

  ```java
  public interface MemberRepository ... {  
    List<UsernameOnly> findProjectionsByUsername(String username);
  }
  ```

- 메서드 이름은 자유, 반환 타입으로 조회할 필드를 인지  

  ```java
  	@Test  
    public void projections() throws Exception {  
      //given  
      Team teamA = new Team("teamA"); em.persist(teamA);  
      Member m1 = new Member("m1", 0, teamA); Member m2 = new Member("m2", 0, teamA);  
      em.persist(m1);  
      em.persist(m2);  
      
      em.flush();  
      em.clear();  
      
  		List<UsernameOnly> result = memberRepository.findProjectionsByUsername("m1");  
      
      Assertions.assertThat(result.size()).isEqualTo(1);    
    }  
  
  /*   
  디버깅 모드에서 username 조회하는 쿼리 확인  
  select m.username from member m   
  where m.username=‘m1’;  
  */  
  ```

### 인터페이스 기반 Projection

```java
// Closed Projection  
public interface UsernameOnly {  
   String getUsername();  
}  
  
// Open Projection  
public interface UsernameOnly {  
  @Value("#{target.username + ' ' + target.age + ' ' + target.team.name}")  
  String getUsername();  
}  
```

- Open projection 사용시 DB에서 entity 필드를 모두 조회해온 다음에 계산   
  -> JPQL SELECT 절 최적화가 안됨

### 클래스 기반 Projection

구체적인 DTO 형식을 사용해서 생성자의 파라미터 이름으로 매칭

```java
 public class UsernameOnlyDto {  
   private final String username;  
     
   public UsernameOnlyDto(String username) {  // 생성자의 parameter 이름으로 필드 매칭
     this.username = username;  
   }
      
   public String getUsername() {  
     return username;  
   }  
 }
```

### 동적 Projections

```java
<T> List<T> findProjectionsByUsername(String username, Class<T> type);  
  
List<UsernameOnly> result = memberRepository.findProjectionsByUsername("m1", UsernameOnly.class);
```

### 중첩 구조 처리

```java 
public interface NestedClosedProjection {  
  String getUsername();  
  TeamInfo getTeam();  
  interface TeamInfo {  
    String getName();  
  }  
}

```

- 호출되는 쿼리  

  ```sql
  select  
    m.username as col_0_0_,   
    t.teamid as col_1_0_,  
    t.teamid as teamid1_2_,  
    t.name as name2_2_  
  from  
  	member m  
  left outer join  
  	team t  
  	  on m.teamid=t.teamid  
  where  
  	m.username=?
  ```

### **주의**

  - 프로젝션 대상이 root 엔티티면, JPQL SELECT 절 최적화 가능 
  - 프로젝션 대상이 ROOT가 아니면
    - LEFT OUTER JOIN 처리
    -  모든 필드를 SELECT해서 엔티티로 조회한 다음에 계산

### 정리

- 프로젝션 대상이 root 엔티티면 유용
- 프로젝션 대상이 root 엔티티를 넘어가면 JPQL SELECT 최적화가 안됨
- 실무의 복잡한 쿼리를 해결하기에는 한꼐가 있음
- 실무에서 단순할 때만 사용하고, 복잡해지면 QueryDsl 사용 추천

<br>

## 4. 네이티브 쿼리

SQL 쿼리를 직접 짜서 사용  
가급적 사용하지 않는 것이 좋음

### Spring Data JPA 기반 네이티브 쿼리

- 페이징 지원
- 반환 타입
  - Object[]
  - Tuple
  - DTO (Spring Data Interface Projections 지원)
- 제약
  - Sort 파라미터를 통한 정렬이 정상 동작하지 않을 수 있음
  - JPQL 처럼 어플리케이션 로딩 시점에 문법 확인 불가
  - 동적 쿼리 불가

### JPA 네이티브 SQL 지원

```java
public interface MemberRepository extends JpaRepository<Member, Long> {  
  @Query(value = "select * from member where username = ?", nativeQuery =
  true)  
  Member findByNativeQuery(String username);  
}
```

- **네이티브 SQL을 DTO로 조회할 때는 JdbcTemplate or myBatis 권장**
- JPQL은 위치 기반 파리미터를 1부터 시작하지만 네이티브 SQL은 0부터 시작 
- 네이티브 SQL을 엔티티가 아닌 DTO로 변환은 하려면
  - DTO 대신 JPA TUPLE 조회
  - DTO 대신 MAP 조회
  - @SqlResultSetMapping -> 복잡
  - Hibernate ResultTransformer를 사용해야함 -> 복잡 
  - https://vladmihalcea.com/the-best-way-to-map-a-projection-query-to-a-dto-with-jpa-and-hibernate/

### Projections 활용

```java
@Query(value = "SELECT m.member_id as id, m.username, t.name as teamName FROM member m left join team t",
              countQuery = "SELECT count(*) from member",
              nativeQuery = true)  
Page<MemberProjection> findByNativeProjection(Pageable pageable);
```

### 동적 네이티브 쿼리

- Hibernate를 직접 활용
- 스프링 JdbcTemplate, MyBatis, jooq 같은 외부 라이브러리 사용

