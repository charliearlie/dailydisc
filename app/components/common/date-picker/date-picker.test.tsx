import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("should render correctly", () => {
    const name = "test-date-picker";
    const { getByText } = render(<DatePicker name={name} />);

    expect(getByText("Pick a date")).toBeInTheDocument();
  });
});
