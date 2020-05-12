import React, { useState } from 'react';
import { ApolloError } from 'apollo-client';
import { ExecutionResult } from 'apollo-link';
import { MutationFunctionOptions } from 'schema/types';
import { LoginPayload, LoginVariables } from '../';
import Loading from 'components/Loading';
import Error from 'components/Error';

import './style.css';

const LoginForm = ({
  loginUser,
  loading,
  error,
}: {
  loginUser: (
    options?:
      | MutationFunctionOptions<LoginPayload, LoginVariables>
      | undefined,
  ) => Promise<ExecutionResult<LoginPayload>>;
  loading: boolean;
  error: ApolloError | undefined;
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginUser({
      variables: {
        input: {
          email,
          password,
        },
      },
    }).catch(() => {}); // Unless we catch, a network error will cause an unhandled rejection: https://github.com/apollographql/apollo-client/issues/3963
  };

  return (
    <div className="login-container">
      <div className="gutter" />
      <div className="login-main">
        {error && <Error error={error} />}
        {loading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-control"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Log in
            </button>
          </form>
        )}
      </div>
      <div className="gutter" />
    </div>
  );
};

export default LoginForm;