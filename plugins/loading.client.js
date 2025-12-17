import { createVNode, render } from 'vue'
import LoadingModal from '~/components/Modals/LoadingModal.vue'

export default defineNuxtPlugin(() => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(LoadingModal)
    render(vnode, container)

    const loading = {
        show(message) {
            vnode.component.exposed.show(message)
        },
        hide() {
            vnode.component.exposed.hide()
        }
    }

    return {
        provide: {
            loading
        }
    }
})