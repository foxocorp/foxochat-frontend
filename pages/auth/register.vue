<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-form-header">
        <div class="login-form-title">
          <div class="form">
            <div class="login-title">Sign up</div>
            <div class="form-login">
              <div class="login">
                <label class="login-label">Username</label>
                <input
                    type="text"
                    class="login-input"
                    placeholder="Enter your username"
                    v-model="username"
                    required
                />
                <label class="login-label">Email</label>
                <input
                    type="email"
                    class="login-input"
                    placeholder="your.email@domain.com"
                    v-model="email"
                    required
                />
                <label class="login-label">Password</label>
                <input
                    type="password"
                    class="login-input"
                    placeholder="Choose a secure password"
                    v-model="password"
                    required
                />
              </div>
            </div>
          </div>
          <div class="login-button">
            <form @submit.prevent="handleRegister">
              <button type="submit" class="button">
                <span>Register</span>
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
            <button @click="goToLogin" class="reset-password-button">
                Already have an account?
              <img src="/svg/already-have-account.svg" alt="already have account" />
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
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const authStore = useAuthStore();
    const router = useRouter();

    const handleRegister = async () => {
      try {
        const response = await api.register(username.value, email.value, password.value);

        if (response && response.accessToken) {
          const token = response.accessToken;
          authStore.login(token);

          await router.push('/');
        } else {
          alert('Ошибка');
        }
      } catch (error) {
        console.error(error);
        alert('Ошибка 2');
      }
    };

    const goToLogin = () => {
      console.log(1)
      router.push('/auth/login');
    };

    return {
      username,
      email,
      password,
      handleRegister,
      goToLogin,
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
  color: #ececec;
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
  margin-top: 30px;
}

.login {
  display: flex;
  flex-direction: column;
}

.login-label {
  font: 500 18px var(--font-family);
  color: #ececec;
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
  margin-top: 195px;
}

.button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 14px;
  width: 368px;
  height: 48px;
  background: #ececec;
  font: 600 20px var(--font-family);
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  color: #fff;
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

.reset-password-button {
  font: 500 15px var(--font-family);
  color: #ececec;
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
}

.reset-password-button button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.reset-password-button img {
  width: 20px;
  height: 20px;
}

.reset-password-button:hover {
  background-color: rgba(11, 11, 11, 0.8);
  transform: scale(1.05);
}

.reset-password-button:active {
  background-color: rgba(66, 66, 66, 0.9);
  transform: scale(0.95);
}

</style>
