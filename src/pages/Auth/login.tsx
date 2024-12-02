import { Button, Stack, TextField } from "@components/base";

export function Login() {
    return (
        <Stack>
			<h1>Log in</h1>
			<TextField label="Email" type="email" />
			<TextField label="Password" type="password" />
			<Button>Log in</Button>
        </Stack>
    );
}
