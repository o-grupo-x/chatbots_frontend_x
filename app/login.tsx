import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Form,
  Input,
  Button,
} from "@heroui/react";
import style from "./login.module.css";

export default function App() {
  const [submitted, setSubmitted] = React.useState(null);

  const onSubmit = (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));

    setSubmitted(data);
  };

  return (
    <div className={style.frame}>
      <Card className="w-[40vw]">
        <CardHeader className="flex gap-3">
          <Image
            alt="heroui logo"
            height={40}
            radius="sm"
            src="https://cdn-icons-png.flaticon.com/512/75/75519.png"
            width={40}
          />
          <div className="flex flex-col">
            <h1 className={style.h1Class}>Login</h1>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Form
            className="w-full max-w-xs"
            validationBehavior="native"
            onSubmit={onSubmit}
          >
            <Input className={style.labelClass}
              isRequired
              errorMessage="Please enter a valid email"
              label="Email"
              labelPlacement="outside"
              name="email"
              placeholder="Enter your email"
              type="email"
            />
            <Button type="submit" variant="bordered" className={style.buttonClass}>
              Submit
            </Button>
            {submitted && (
              <div className="text-small text-default-500">
                You submitted: <code>{JSON.stringify(submitted)}</code>
              </div>
            )}
          </Form>
        </CardBody>
        <Divider />
        <CardFooter>
          <Link
            isExternal
            showAnchorIcon
            href="https://github.com/heroui-inc/heroui"
          >
            Visit source code on GitHub.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
