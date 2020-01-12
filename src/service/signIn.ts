
import axios from 'axios';

export async function signIn(user: string, pass: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    axios.post('http://localhost:3000/auth', {
      user: 'user',
      pass: 'pass'
    }).then((res) => {
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