import { Component } from "react";
import { HiExclamationTriangle } from "react-icons/hi2";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface in dev tools without crashing the whole tab for the user.
    console.error("AURA-X crashed:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 bg-white dark:bg-nightbg">
        <div className="max-w-sm w-full text-center rounded-3xl bg-white/90 dark:bg-nightcard/90 backdrop-blur p-8 border border-white/60 dark:border-white/10 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <HiExclamationTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="font-display font-semibold text-lg text-gray-800 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 leading-relaxed">
            AURA-X hit an unexpected error. Your saved data is untouched —
            reloading usually fixes this.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-5 w-full px-4 py-2.5 rounded-xl bg-linear-to-r from-lilac to-babypink text-gray-800 font-medium text-sm shadow-md"
          >
            Reload AURA-X
          </button>
        </div>
      </div>
    );
  }
}
