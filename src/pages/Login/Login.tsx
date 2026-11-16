import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AppIcon } from "../../components/common/AppIcon";
import { Icon } from "../../components/common/Icon";
import { Banner, Button, Field, Input, Label } from "../../styles/ui";
import { BackLink, LoginCard, LoginHead, LoginShell, PasswordWrap } from "./LoginStyles";

export const Login = () => {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Return to the admin page that sent the user here, if any.
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failed, setFailed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAdmin) return <Navigate to={from} replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) navigate(from, { replace: true });
    else setFailed(true);
  };

  return (
    <LoginShell>
      <LoginCard>
        <LoginHead>
          <div>
            <AppIcon size={26} />
          </div>
          <h1>Admin Login</h1>
          <p>Sign in to manage the library.</p>
        </LoginHead>

        <form onSubmit={onSubmit} noValidate>
          {failed && (
            <Banner $tone="danger" role="alert">
              <Icon name="alert" />
              <span>Incorrect email or password.</span>
            </Banner>
          )}
          <Field>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              $invalid={failed}
              onChange={(e) => {
                setEmail(e.target.value);
                setFailed(false);
              }}
            />
          </Field>
          <Field>
            <Label htmlFor="login-password">Password</Label>
            <PasswordWrap>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                $invalid={failed}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFailed(false);
                }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((s) => !s)}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
              </button>
            </PasswordWrap>
          </Field>
          <Button type="submit" disabled={!email || !password}>
            Sign in
          </Button>
        </form>

        <BackLink to="/">
          <Icon name="chevronLeft" size={15} />
          Back to all books
        </BackLink>
      </LoginCard>
    </LoginShell>
  );
};
