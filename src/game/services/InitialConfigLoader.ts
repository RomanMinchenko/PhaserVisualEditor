import { IConfig } from "../components/interfaces";

export default class InitialConfigLoader {
  private endpointFactory: (id: string) => string;

  constructor(endpointFactory: (id: string) => string = (id) => `/api/config/${id}`) {
    this.endpointFactory = endpointFactory;
  }

  public async loadByQueryParam(paramName = "id"): Promise<IConfig[] | null> {
    const id = this.getIdFromQuery(paramName);

    if (!id) {
      return null;
    }

    try {
      const response = await fetch(this.endpointFactory(id));

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      return this.isConfigList(payload) ? payload : null;
    } catch (_error) {
      return null;
    }
  }

  private getIdFromQuery(paramName: string): string | null {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get(paramName)?.trim();

    if (!id) {
      return null;
    }

    return id;
  }

  private isConfigList(payload: unknown): payload is IConfig[] {
    return Array.isArray(payload);
  }
}