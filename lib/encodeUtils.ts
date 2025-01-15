// 简单的Base64编码解码工具
export function encodeId(id: string | number): string {
  return Buffer.from(String(id)).toString('base64');
}

export function decodeId(encodedId: string): string {
  return Buffer.from(encodedId, 'base64').toString('utf8');
}
