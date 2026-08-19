<template>
	<div
		ref="focusTrapStartRef"
		tabindex="0"
		@focus="onFocusTrapStart"
	></div>

	<div ref="containerRef">
		<slot></slot>
	</div>

	<div
		ref="focusTrapEndRef"
		tabindex="0"
		@focus="onFocusTrapEnd"
	></div>
</template>

<script>
const { defineComponent, onBeforeUnmount, onMounted, ref, useTemplateRef } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'FocusTrap',
	setup( props, { expose } ) {
		const containerRef = useTemplateRef( 'containerRef' );
		const focusTrapStartRef = useTemplateRef( 'focusTrapStartRef' );
		const focusTrapEndRef = useTemplateRef( 'focusTrapEndRef' );
		const previouslyFocusedElement = ref( null );

		const interceptEvent = ( event ) => ( event.stopPropagation() );
		const stopInterception = () => {
			containerRef.value.removeEventListener( 'mousedown', stopInterception, { capture: true }, true );
			containerRef.value.removeEventListener( 'mouseup', interceptEvent, { capture: true }, true );
			containerRef.value.removeEventListener( 'click', interceptEvent, { capture: true }, true );

			containerRef.value.removeEventListener( 'keydown', stopInterception, { capture: true }, true );
			containerRef.value.removeEventListener( 'keypress', interceptEvent, { capture: true }, true );
			containerRef.value.removeEventListener( 'keyup', interceptEvent, { capture: true }, true );
		};

		/**
		 * Focus the first or last focusable element in a container.
		 *
		 * @param {boolean} backwards - If true, focus the last focusable element
		 */
		function focusFirstFocusableElement( backwards = false ) {
			if ( !containerRef.value ) {
				return;
			}

			if (
				document.activeElement.matches( ':focus' ) &&
				!containerRef.value.contains( document.activeElement ) &&
				focusTrapStartRef.value !== document.activeElement &&
				focusTrapEndRef.value !== document.activeElement
			) {
				// Keep track of previously focused element outside of this trap,
				// to return focus to if/once this trap goes away
				previouslyFocusedElement.value = document.activeElement;
			}

			let candidates = Array.from(
				containerRef.value.querySelectorAll( `
					a, button,
					[tabindex]:not([tabindex^="-"])
				` )
			);

			if ( backwards ) {
				candidates = candidates.reverse();
			}

			for ( const candidate of candidates ) {
				candidate.focus();
				if ( document.activeElement === candidate ) {
					return;
				}
			}
		}

		const onFocusTrapStart = () => {
			focusFirstFocusableElement( true );
		};

		const onFocusTrapEnd = () => {
			focusFirstFocusableElement( false );
		};

		onMounted( () => {
			focusFirstFocusableElement( false );

			// We just changed focus to a new element, but there could
			// still be an ongoing mouse or keyboard event chain, one that
			// would now start applying to the newly-focused element even
			// though it was not an action intended for this element.
			// In order to prevent this from happening, we'll capture mouse
			// and keyboard events, and stop them from propagating until we
			// encounter one of the events that starts of the chain
			// (mousedown or keydown). Any other events (mouseup, click,
			// keypress, keyup) encountered before that, were remnants of
			// an existing event chain that was never meant for this element.
			containerRef.value.addEventListener( 'mousedown', stopInterception, { capture: true }, true );
			containerRef.value.addEventListener( 'mouseup', interceptEvent, { capture: true }, true );
			containerRef.value.addEventListener( 'click', interceptEvent, { capture: true }, true );

			containerRef.value.addEventListener( 'keydown', stopInterception, { capture: true }, true );
			containerRef.value.addEventListener( 'keypress', interceptEvent, { capture: true }, true );
			containerRef.value.addEventListener( 'keyup', interceptEvent, { capture: true }, true );
		} );

		onBeforeUnmount( () => {
			stopInterception();

			// Move focus back to the element it was at originally
			if ( previouslyFocusedElement.value && previouslyFocusedElement.value.focus ) {
				previouslyFocusedElement.value.focus();
			}
		} );

		expose( { focusFirstFocusableElement } );

		return {
			focusTrapStartRef,
			focusTrapEndRef,
			containerRef,
			onFocusTrapStart,
			onFocusTrapEnd
		};
	}
} );
</script>
