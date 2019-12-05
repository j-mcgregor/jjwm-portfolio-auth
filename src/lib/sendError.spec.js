import sendError from './sendError';

describe('sendError', () => {
  const next = jest.fn();
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const key = 'someKey';
  const message = 'Something went wrong';
  const status = 400;
  it('should return an error if invoked with all the correct arguments', () => {
    sendError(next, mockResponse(), key, message, status);
  });
});
