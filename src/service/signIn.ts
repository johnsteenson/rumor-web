
import axios from 'axios';

function callSignInApi(body: { user?: string, pass?: string, token?: string }): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    axios.post(`${process.env.VUE_APP_SERVICE_ENDPOINT}/auth`, body).then((res) => {
      if (!res.data.token) {
        console.error('No token present on payload', res.data);
        reject();
      }

      resolve(res.data.token);
    })
      .catch((err) => {
        console.error('Error signing in to service', err);
        reject();
      });

  });
}


export async function signIn(user: string, pass: string): Promise<string> {
  return callSignInApi({
    user,
    pass
  });
}

export async function signInWithToken(token: string): Promise<string> {
  return callSignInApi({
    token
  });
}