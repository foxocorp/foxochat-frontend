<template>
  <div class="register-container">
    <div class="register-form">
      <div class="register-form-header">
        <div class="register-form-title">
          <div class="form">
            <div class="register-title">Sign up</div>
            <div class="form-register">
              <div class="register">
                <label class="register-label">Username</label>
                <input
                    type="text"
                    class="register-input"
                    placeholder="Enter your username"
                    v-model="username"
                    required
                />
                <label class="register-label">Email</label>
                <input
                    type="email"
                    class="register-input"
                    placeholder="your.email@domain.com"
                    v-model="email"
                    required
                />
                <label class="register-label">Password</label>
                <input
                    type="password"
                    class="register-input"
                    placeholder="Choose a secure password"
                    v-model="password"
                    required
                />
              </div>
            </div>
          </div>
          <div class="register-button">
            <form @submit.prevent="handleRegister">
              <button type="submit" class="button">
                <span>Register</span>
                <img src="/svg/arrow-left.svg" alt="arrow left">
              </button>
            </form>
          </div>
          <div class="divider"></div>
          <div class="form-register-buttons">
            <button
                v-for="(button, index) in socialButtons"
                :key="index"
                class="form-register-button"
                @click="button.action"
            >
              <img :src="button.icon" :alt="`${button.label} register`" />
            </button>
          </div>
          <div class="divider"></div>
          <div class="another-register-buttons">
            <button @click="goToRegister" class="reset-password-button">
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

    const goToRegister = () => {
      console.log(1)
      router.push('/auth/register');
    };

    return {
      username,
      email,
      password,
      handleRegister,
      goToRegister,
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
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.register-container::before,
.register-container::after {
  content: "";
  position: fixed;
  width: 500px;
  height: 500px;
  background: rgba(74, 137, 255, 0.8);
  border-radius: 50%;
  filter: blur(200px);
  z-index: 0;
}

.register-container::before {
  bottom: -200px;
  left: -200px;
}

.register-container::after {
  top: -200px;
  right: -200px;
}

.register-form {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 100%;
}

.register-form-header {
  width: 100%;
  max-width: 400px;
}

.register-form-title {
  text-align: left;
}

.form {
  width: 368px;
  height: 161px;
}

.register-title {
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

.form-register {
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.register {
  display: flex;
  flex-direction: column;
}

.register-label {
  font: 500 18px var(--font-family);
  color: #ececec;
  margin-bottom: 5px;
}

.register-input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.register-button {
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

.form-register-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-register-button {
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

.form-register-button img {
  width: 25px;
  height: 25px;
}

.form-register-button:hover {
  background-color: rgba(11, 11, 11, 0.8);
  transform: scale(1.05);
}

.form-register-button:active {
  background-color: rgba(66, 66, 66, 0.9);
  transform: scale(0.95);
}

.another-register-buttons {
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
