import { getErrorMessage } from "./error-boundary";

// These tests below don't really do anything but gives us a foundation to build on
describe("getErrorMessage", () => {
  it("returns the error message if it is a string", () => {
    const errorMessage = "This is an error message";
    expect(getErrorMessage(errorMessage)).toEqual(errorMessage);
  });

  it("returns the error message if it is an object with a message property", () => {
    const error = { message: "This is an error message" };
    expect(getErrorMessage(error)).toEqual(error.message);
  });

  it('returns "Unknown Error" if the error is not a string or an object with a message property', () => {
    const error = 123;
    expect(getErrorMessage(error)).toEqual("Unknown Error");
  });
});
