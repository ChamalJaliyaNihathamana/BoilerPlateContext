import * as React from "react";

import { Container, Card, Form, Button } from "react-bootstrap";
import { useAuthProvider } from "../context/AuthProvider";
interface LoginPageProps {}

const LoginPage: React.FunctionComponent<LoginPageProps> = () => {
  const { signUp } = useAuthProvider();

  // use-states
  const [input, setInput] = React.useState({
    username: "",
    password: "",
  });

  const handleInput = (event: any) =>
    setInput({
      ...input,
      [event.target.name]: event.target.value,
    });

  const onSubmitHandler = (e: any) => {
    signUp("cjlaiya.sln2@gmail.com").then((userData) => {

    });
  };

  return (
    <Container>
      <Card
        style={{ width: "18rem", height: "25rem" }}
        className="center-screen"
      >
        <Card.Body>
          <Card.Title>Register Page</Card.Title>
          <Form onSubmit={onSubmitHandler}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={input.username}
                onChange={handleInput}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={input.password}
                onChange={handleInput}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
