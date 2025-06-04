<script setup>
import SjbImage from '@/assets/images/sjb.png'
import axiosIns from '@/plugins/axios'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { requiredValidator } from '@validators'
import { result } from 'lodash'
import Swal from 'sweetalert2'
import { VForm } from 'vuetify/components'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const ability = useAppAbility()
const loading = ref(false)

const errors = ref({
  username: undefined,
  password: undefined,
})

const refVForm = ref()
const username = ref('')
const email = ref('')

const emailValidator = value => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Email tidak valid'
}

const resetPassword = async () => {
  loading.value = true
  try {
    const res = await axiosIns.post('/reset-password', {
      username: username.value,
      email: email.value,
    })

    loading.value = false

    Swal.fire({
      title: 'Berhasil',
      text: `Password berhasil di-reset dan dikirim ke ${res.data.email}.`,
      icon: 'success',
    }).then(() => {
      router.push('/login')
    })
  } catch (error) {
    loading.value = false

    Swal.fire({
      title: 'Gagal',
      text: error?.response?.data?.message || 'Terjadi kesalahan.',
      icon: 'error',
    })

    console.log(error)
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      Swal.fire({
        title: 'LBG',
        text: `Reset password akan dikirim ke email: ${email.value}. Anda yakin ingin melanjutkan?`,
        icon: `question`,
        showCancelButton: true,
        confirmButtonColor: 'warning',
        confirmButtonText: 'Ya, Lanjutkan!',
        cancelButtonText: 'Batal',
        cancelButtonColor: 'primary',
        reverseButtons: true,
        customClass: {
          actions: 'my-swal-actions',
          confirmButton: 'my-confirm-button',
          cancelButton: 'my-cancel-button',
        },
      }).then(result => {
        if (result.isConfirmed) {
          resetPassword()
        }
      })
    }
  })
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative auth-bg rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="325"
            :src="SjbImage"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          :src="authThemeMask"
          class="auth-footer-mask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
          />

          <h5 class="text-h5 font-weight-semibold mb-1">
            Mengalami kendala saat login?
          </h5>
          <p class="mb-0">
            Silakan tulis username dan email. Password baru akan dikirim ke email.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- username -->
              <VCol cols="12">
                <VTextField
                  v-model="username"
                  label="Username"
                  :rules="[requiredValidator]"
                  :error-messages="errors.username"
                />
              </VCol>

              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  label="Email"
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  Reset Password
                </VBtn>
                <div class="d-flex align-center flex-wrap justify-space-between mt-2">
                  <RouterLink
                    class="text-primary ms-2 "
                    :to="{ name: 'login' }"
                  >
                    Back to login
                  </RouterLink>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.my-swal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 3rem;
}

.my-confirm-button,
.my-cancel-button {
  min-width: 100px;
}
</style>

<route lang="yaml">
meta:
  layout: blank
  action: Read
  subject: Auth
  redirectIfLoggedIn: true
</route>
