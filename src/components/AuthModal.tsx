import leverLogo from "@/assets/lever-nobg.png";
import { useAuth } from "@/utils/AuthProvider";
import { useUserConfig } from "@/utils/UserConfigProvider";
import type React from "react";
import { useState } from "react";

function InputField({
	label,
	type = "text",
	placeholder,
	value,
	onChange,
}: {
	label: string;
	type?: "text" | "password";
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="w-full">
			<label
				htmlFor={label.toLowerCase()}
				className="self-start text-sm font-medium tracking-wide text-neutral-900 font-heading"
			>
				{label}
			</label>
			<input
				id={label.toLowerCase()}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full px-4 py-3.5 mt-2 font-light text-zinc-600 rounded-xl border border-solid border-black border-opacity-20 bg-stone-300 bg-opacity-0 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] font-body"
			/>
		</div>
	);
}

function SocialSignInButton({
	icon,
	text,
	onClick,
}: {
	icon: string;
	text: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex gap-2.5 px-16 py-1.5 w-full text-black rounded-xl border border-solid border-black border-opacity-20 bg-red-500 bg-opacity-0 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] font-body"
		>
			<img
				src={icon}
				alt=""
				className="object-contain shrink-0 aspect-square w-[29px]"
			/>
			<span className="grow shrink self-center w-[140px] text-sm font-medium">
				{text}
			</span>
		</button>
	);
}

export const AuthModal: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);

	const { signIn, signUp } = useAuth();
	// const { fetchUserConfig, fetchThreads } = useUserConfig();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const authResponse = isSignUp
				? await signUp({ email, password })
				: await signIn({ email, password });

			// Fetch user config after successful sign in
			// if (authResponse.user?.id) {
			// 	await fetchUserConfig();
			// 	await fetchThreads();
			// }
		} catch (err) {
			console.error(err);
			setError("Invalid email or password");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Overlay */}
			<div className="fixed inset-0 bg-black/50 transition-opacity" />

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative transform sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
					<div className="text-sm font-medium tracking-wide text-center max-w-[460px] text-neutral-900">
						<form
							onSubmit={handleSubmit}
							className="flex flex-col px-20 py-9 w-full bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.1)]"
						>
							{isSignUp ? (
								<h2 className="text-2xl font-semibold">Sign Up</h2>
							) : (
								<h2 className="text-2xl font-semibold">Sign In</h2>
							)}
							<img
								src={leverLogo}
								alt="Logo"
								className="object-contain self-center max-w-full aspect-[2.28] w-[162px]"
							/>

							<div className="mt-6 w-full">
								<InputField
									label="Email"
									type="text"
									placeholder="Enter your email"
									value={email}
									onChange={setEmail}
								/>
							</div>

							<div className="mt-4 w-full">
								<InputField
									label="Password"
									type="password"
									placeholder="**********"
									value={password}
									onChange={setPassword}
								/>
							</div>

							{error && (
								<div className="text-red-500 text-sm text-center mt-4 font-body">
									{error}
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="px-16 py-3.5 mt-8 text-white bg-sky-400 rounded-xl shadow-[0px_4px_10px_rgba(233,68,75,0.25)] font-heading"
							>
								{loading
									? isSignUp
										? "Signing up..."
										: "Signing in..."
									: isSignUp
										? "Sign up"
										: "Sign in"}
							</button>

							<div className="mt-6">
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-300" />
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="bg-white px-2 text-gray-500 font-body">
											Or
										</span>
									</div>
								</div>

								<div className="mt-6">
									<SocialSignInButton
										icon="https://cdn.builder.io/api/v1/image/assets/7cbfb130182046beab226ee58fb45705/e75e3d48601cab0bef88206e8df8c967ef4fa0b9?placeholderIfAbsent=true"
										text="Sign in with Google"
										onClick={handleGoogleSignIn}
									/>
								</div>
							</div>

							<p className="self-center mt-4 text-xs tracking-wide font-body">
								<span className="text-[#595959]">Don't have an account?</span>{" "}
								<button
									type="button"
									className="text-[#3CCADD]"
									onClick={() => setIsSignUp(!isSignUp)}
								>
									{isSignUp ? "Already have an account?" : "Sign up for free!"}
								</button>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthModal;
