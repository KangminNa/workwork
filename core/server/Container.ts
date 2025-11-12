import "reflect-metadata";

export class Container {
  private controllers = new Map<string, any>();
  private services = new Map<string, any>();
  private repositories = new Map<string, any>();

  // 싱글톤 인스턴스 캐시
  private serviceInstances = new Map<string, any>();
  private repositoryInstances = new Map<string, any>();

  registerController(target: any) {
    const type = Reflect.getMetadata("controller:type", target);
    const path = Reflect.getMetadata("controller:path", target);
    this.controllers.set(`${type}:${path}`, target);
  }

  registerService(target: any) {
    const name = Reflect.getMetadata("service:name", target);
    this.services.set(name, target);
  }

  registerRepository(target: any) {
    const name = Reflect.getMetadata("repository:name", target);
    this.repositories.set(name, target);
  }

  getControllerConstructor(type: string, path: string) {
    const key = `${type}:${path}`;
    return this.controllers.get(key);
  }

  /**
   * Controller 인스턴스 생성 (매 요청마다 새로 생성)
   * 생성자 파라미터에 명시된 의존성을 자동 주입
   */
  resolveController(type: string, path: string) {
    const key = `${type}:${path}`;
    const Ctor = this.controllers.get(key);
    if (!Ctor) return null;

    // 생성자 의존성 자동 해결
    const dependencies = this.resolveDependencies(Ctor);
    return new Ctor(...dependencies);
  }

  /**
   * Service 싱글톤 인스턴스 반환
   * 생성자 파라미터에 명시된 의존성을 자동 주입
   */
  resolveService(name: string): any {
    // 이미 생성된 인스턴스가 있으면 반환
    if (this.serviceInstances.has(name)) {
      return this.serviceInstances.get(name);
    }

    const Ctor = this.services.get(name);
    if (!Ctor) return null;

    // 생성자 의존성 자동 해결
    const dependencies = this.resolveDependencies(Ctor);
    const instance = new Ctor(...dependencies);
    
    // 싱글톤으로 캐싱
    this.serviceInstances.set(name, instance);
    return instance;
  }

  /**
   * Repository 싱글톤 인스턴스 반환
   */
  resolveRepository(name: string): any {
    // 이미 생성된 인스턴스가 있으면 반환
    if (this.repositoryInstances.has(name)) {
      return this.repositoryInstances.get(name);
    }

    const Ctor = this.repositories.get(name);
    if (!Ctor) return null;

    const instance = new Ctor();
    
    // 싱글톤으로 캐싱
    this.repositoryInstances.set(name, instance);
    return instance;
  }

  /**
   * 생성자 파라미터의 의존성을 자동으로 해결
   */
  private resolveDependencies(Ctor: any): any[] {
    // TypeScript가 생성한 파라미터 타입 메타데이터 읽기
    const paramTypes = Reflect.getMetadata('design:paramtypes', Ctor) || [];
    
    return paramTypes.map((type: any) => {
      if (!type) return null;

      // Repository인지 확인
      const repoName = Reflect.getMetadata('repository:name', type);
      if (repoName) {
        return this.resolveRepository(repoName);
      }

      // Service인지 확인
      const serviceName = Reflect.getMetadata('service:name', type);
      if (serviceName) {
        return this.resolveService(serviceName);
      }

      return null;
    });
  }

  /**
   * 디버깅용: 등록된 모든 컴포넌트 출력
   */
  printRegistry() {
    console.log('\n📦 Container Registry:');
    console.log('Controllers:', Array.from(this.controllers.keys()));
    console.log('Services:', Array.from(this.services.keys()));
    console.log('Repositories:', Array.from(this.repositories.keys()));
  }
}

export const container = new Container();
