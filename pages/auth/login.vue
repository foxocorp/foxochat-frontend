<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-form-header">
        <div class="login-form-title">
          <div class="form">
            <div class="login-title">Log in</div>
            <div class="form-login">
              <div class="login">
                <label class="login-label">Email</label>
                <input
                    type="email"
                    class="login-input"
                    placeholder="floofer@coof.fox"
                    v-model="email"
                    required
                />
                <label class="login-label">Password</label>
                <input
                    type="password"
                    class="login-input"
                    placeholder="your floof password :3"
                    v-model="password"
                    required
                />
              </div>
            </div>
          </div>
          <div class="login-button">
            <form @submit.prevent="handleLogin">
              <button type="submit" class="button">
                <span>Log in</span>
                <img src="/svg/arrow-left.svg" alt="arrow left">
              </button>
            </form>
          </div>
          <div class="divider"></div>
          <div class="form-login-buttons">
            <button
                v-for="(button, index) in socialButtons"
                :key="index"
                class="form-login-button"
                @click="button.action"
            >
              <img :src="button.icon" :alt="`${button.label} login`" />
            </button>
          </div>
          <div class="divider"></div>
          <div class="another-login-buttons">
            <button @click="goToResetPassword" class="reset-password-button">
              Reset your password
              <img src="/svg/reset-password.svg" alt="reset password" />
            </button>

            <button @click="goToCreateAccount" class="create-account-button">
              Create new account
              <img src="/svg/new-user.svg" alt="create new account" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api';
import { useAuthStore } from '~/store/useAuthStore';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
      try {
        const response = await api.login(email.value, password.value);

        if (response && response.accessToken) {
          const token = response.accessToken;
          authStore.login(token);
          alert("Успешный вход")
          await router.push('http://localhost:3001/');
        } else {
          alert('Ошибка');
        }
      } catch (error) {
        console.error(error);
        alert('Ошибка 2');
      }
    };

    const goToResetPassword = () => {
      router.push('/');
    };

    const goToCreateAccount = () => {
      router.push('/auth/register');
    };

    return {
      email,
      password,
      handleLogin,
      goToResetPassword,
      goToCreateAccount,
      socialButtons: [
        { icon: '/svg/google.svg', label: 'Google', action: () => alert('Google') },
        { icon: '/svg/discord.svg', label: 'Discord', action: () => alert('Discord') },
        { icon: '/svg/telegram.svg', label: 'Telegram', action: () => alert('Telegram') },
        { icon: '/svg/github.svg', label: 'GitHub', action: () => alert('GitHub') },
        { icon: '/svg/meta.svg', label: 'Meta', action: () => alert('Meta') },
        { icon: '/svg/apple.svg', label: 'Apple', action: () => alert('Apple') },
      ],
    };
  },
};
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.login-container::before,
.login-container::after {
  content: "";
  position: fixed;
  width: 500px;
  height: 500px;
  background: rgba(74, 137, 255, 0.8);
  border-radius: 50%;
  filter: blur(200px);
  z-index: 0;
}

.login-container::before {
  bottom: -200px;
  left: -200px;
}

.login-container::after {
  top: -200px;
  right: -200px;
}

.login-form {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 100%;
}

.login-form-header {
  width: 100%;
  max-width: 400px;
}

.login-form-title {
  text-align: left;
}

.form {
  width: 368px;
  height: 161px;
}

.login-title {
  font: 800 40px var(--font-family);
  color: var(--secondary-color);
}

input {
  border: 1px solid rgba(96, 96, 96, 0.5) !important;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 5px;
  padding: 13px 14px;
  height: 25px;
}

::placeholder {
  font: 400 16px var(--font-family);
  color: rgba(96, 96, 96, 0.7);
}

.form-login {
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.login {
  display: flex;
  flex-direction: column;
}

.login-label {
  font: 500 18px var(--font-family);
  color: var(--secondary-color);
  margin-bottom: 5px;
}

.login-input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-button {
  display: flex;
  margin-top: 100px;
}

.button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 14px;
  width: 368px;
  height: 48px;
  background: var(--secondary-color);
  font: 600 20px var(--font-family);
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.button:hover {
  background-color: rgba(236, 236, 236, 0.7);
  transform: scale(1.05);
}

.button:active {
  transform: scale(0.95);
}

.button svg {
  margin-left: 10px;
}

.divider {
  padding: 1px;
  width: 366px;
  margin-top: 20px;
  background: rgba(96, 96, 96, 0.5);
}

.form-login-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-login-button {
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(96, 96, 96, 0.5);
  width: 51px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--secondary-color);
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.form-login-button img {
  width: 25px;
  height: 25px;
}

.form-login-button:hover {
  background-color: rgba(11, 11, 11, 0.8);
  transform: scale(1.05);
}

.form-login-button:active {
  background-color: rgba(66, 66, 66, 0.9);
  transform: scale(0.95);
}

.another-login-buttons {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.create-account-button,
.reset-password-button {
  font: 500 15px var(--font-family);
  color: var(--secondary-color);
  border: 1px solid rgba(96, 96, 96, 0.5);
  border-radius: 4px;
  padding: 0 16px;
  width: 368px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.7);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.create-account-button img,
.reset-password-button img {
  width: 20px;
  height: 20px;
}

.create-account-button:hover,
.reset-password-button:hover {
  background-color: rgba(11, 11, 11, 0.8);
  transform: scale(1.05);
}

.create-account-button:active,
.reset-password-button:active {
  background-color: rgba(66, 66, 66, 0.9);
  transform: scale(0.95);
}
</style>