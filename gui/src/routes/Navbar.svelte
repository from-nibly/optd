<script>
</script>

<div class="navbar bg-base-100 mb-32 shadow-xl text-neutral-content bg-primary">
	<label for="my-drawer" class="btn btn-primary drawer-button lg:hidden"
		><svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			aria-hidden="true"
			class="h-5 inline-block w-5"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
			></path></svg
		></label
	>
	<div class="flex-1">
		<a class="btn btn-ghost text-xl text-white" href="/">Home</a>
	</div>
	<div class="flex-none gap-2">
		<div class="form-control">
			<input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
		</div>
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
				<div class="w-10 rounded-full">
					<img
						alt="Tailwind CSS Navbar component"
						src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
					/>
				</div>
			</div>
			<ul class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
				<li>
					<a class="justify-between" href="/">
						Profile
						<span class="badge">New</span>
					</a>
				</li>
				<li><a href="/">Settings</a></li>
				<li><a href="/">Logout</a></li>
			</ul>
		</div>
	</div>
</div>
