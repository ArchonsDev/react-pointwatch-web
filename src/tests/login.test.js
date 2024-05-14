import { render, screen, cleanup } from "@testing-library/react";
import Login from "../login/index";

test("render login page", () => {
  render(<Login />);
  const loginElement = screen.getByTestId("login-1");

  expect(loginElement).toBeInTheDocument();
});
