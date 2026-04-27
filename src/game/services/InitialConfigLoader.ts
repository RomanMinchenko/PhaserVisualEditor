import { IApplicationData } from "./interfaces";

export default class InitialConfigLoader {
  private apiUrl = 'https://backend.main.zeta.faino.dev/api';
  private endpointFactory: (id: string) => string;

  constructor(endpointFactory: (id: string) => string = (id) => `/lms/public/interactive/exercises/${id}`) {
    this.endpointFactory = endpointFactory;
  }

  public async loadByQueryParam(paramName = "id"): Promise<IApplicationData | null> {
    const id = this.getIdFromQuery(paramName);

    if (!id) {
      return null;
    }

    try {
      const response = await fetch(this.apiUrl + this.endpointFactory(id));

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();

      return payload as IApplicationData;
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
}