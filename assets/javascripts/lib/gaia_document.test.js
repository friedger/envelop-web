import Record from './records/record';
import GaiaDocument from './gaia_document';

function mockSession(session) {
  Record.config({ session });
}

function serialize(payload) {
  return JSON.parse(JSON.stringify(payload));
}

describe('.save', () => {
  test('sets file path', async () => {
    mockSession({ putFile: async() => true });

    const attributes = {
      fileName: 'name.pdf',
      fileSize: 500,
      file: new File([1], '...')
    }
    const doc = new GaiaDocument(attributes);
    await doc.save();

    expect(doc.filePath).toMatch(/^[a-zA-Z0-9]{24}\/name\.pdf$/);
  });
});

describe('v1', () => {
  const v1Attributes = {
    id: '123',
    url: 'abcdef/name.pdf',
    size: 500,
    created_at: new Date('2019-07-16T10:47:39.865Z'),
    num_parts: 2,
    uploaded: true
  }

  describe('.get', () => {
    test('parses document', async () => {
      mockSession({ getFile: async() => JSON.stringify(v1Attributes) })

      const doc = await GaiaDocument.get('123');

      expect(doc.filePath).toBe('abcdef/name.pdf');
      expect(doc.fileName).toBe('name.pdf');
      expect(doc.fileSize).toBe(500);
      expect(doc.createdAt).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.numParts).toBe(2);
      expect(doc.uploaded).toBe(true);
      expect(doc.version).toBe(1);
    });
  });

  describe('.fromGaiaIndex', () => {
    test('parses payload', async () => {
      const doc = await GaiaDocument.fromGaiaIndex(v1Attributes);

      expect(doc.filePath).toBe('abcdef/name.pdf');
      expect(doc.fileName).toBe('name.pdf');
      expect(doc.fileSize).toBe(500);
      expect(doc.createdAt).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.numParts).toBe(2);
      expect(doc.uploaded).toBe(true);
      expect(doc.version).toBe(1);
    });
  });

  describe('.serialize', () => {
    test('serializes from v1 attributes', async () => {
      mockSession({ getFile: async() => JSON.stringify(v1Attributes) })

      const doc = await GaiaDocument.get('123');
      const docJson = serialize(doc);

      const expectedJson = serialize({
        id: '123',
        content_type: null,
        localId: '123',
        version: 1,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        size: 500,
        url: 'abcdef/name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });

    test('serializes from new attributes', async () => {
      const attributes = {
        id: '123',
        filePath: 'abcdef/name.pdf',
        fileSize: 500,
        createdAt: new Date('2019-07-16T10:47:39.865Z'),
        numParts: 2,
        uploaded: true
      }

      const doc = new GaiaDocument(attributes);
      const docJson = serialize(doc);

      const expectedJson = serialize({
        id: '123',
        content_type: null,
        localId: '123',
        version: 1,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        size: 500,
        url: 'abcdef/name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });
  });
});
