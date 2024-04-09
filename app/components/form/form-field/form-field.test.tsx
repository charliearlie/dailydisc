import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { FormField } from "./form-field";

describe("FormField", () => {
  it("renders the label and input correctly", () => {
    const label = "Username";
    const inputName = "username";

    const { container, getByLabelText } = render(
      <FormField label={label} name={inputName} />
    );

    const input = getByLabelText(label);

    expect(input).toHaveAttribute("name", inputName);
    expect(container).toMatchSnapshot();
  });

  it("renders the errors correctly", () => {
    const label = "Username";
    const inputName = "username";
    const errors = [
      "Username is required",
      "Username must be at least 6 characters long",
    ];
    const { getByText } = render(
      <FormField label={label} name={inputName} errors={errors} />
    );
    errors.forEach((error) => {
      expect(getByText(error)).toBeInTheDocument();
    });
  });

  it("should put the input into an error state when there are errors", () => {
    const label = "Username";
    const inputName = "username";
    const errors = [
      "Username is required",
      "Username must be at least 6 characters long",
    ];
    const { getByLabelText } = render(
      <FormField label={label} name={inputName} errors={errors} />
    );

    const inputElement = getByLabelText(label);

    expect(inputElement).toHaveAttribute("aria-invalid", "true");
  });
});
