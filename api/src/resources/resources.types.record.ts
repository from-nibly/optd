import { GlobalMetaRecord } from 'src/types/types.record';
import { Resource } from './resources.types';

//TODO: implements record
export class ResourceRecord extends Resource {
  metadata: GlobalMetaRecord;
  _rev: string;
  _id: string;

  constructor(partial: ResourceRecord) {
    super(partial);
    this.metadata = new GlobalMetaRecord(partial.metadata);
    this._id = partial._id;
    this._rev = partial._rev;
  }

  static createID(namespace: string, name: string): string {
    return `ns/${namespace}/${name}`;
  }

  static splitID(id: string): { name: string; namespace: string } {
    const [_, namespace, name] = id.split('/');
    return { name, namespace };
  }
}
