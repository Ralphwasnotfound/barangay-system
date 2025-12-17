import { createVNode, render } from 'vue'
import NotificationModal from '~/components/Modals/NotificationModal.vue'

export default defineNuxtPlugin(() => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(NotificationModal)
    render(vnode, container)

    const notify = {
        success(message, title = 'Success') {
            vnode.component.exposed.show({
                title,
                message,
                type: 'success'
            })
        },

        error(message, title = 'Error') {
            vnode.component.exposed.show({
                title,
                message,
                type: 'error',
                duration: 6000
            })
        },

        warning(message, title = 'Warning') {
            vnode.component.exposed.show({
                title,
                message,
                type: 'warning'
            })
        },

        info(message, title = 'Info') {
            vnode.component.exposed.show({
                title,
                message,
                type: 'info'
            })
        }
    }

    return {
        provide: {
            notify
        }
    }
})
