export interface StorageFile {
  fileName: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface IStorageProvider {
  upload(
    file: StorageFile,
    folder?: string,
    options?: { preserveFileName?: boolean },
  ): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string): Promise<string>;
}
